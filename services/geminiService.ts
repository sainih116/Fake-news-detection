import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { AnalysisResult, AnalysisMode } from '../types';
import { Classification } from '../types';

// Helper to get client safely, preventing module-load crashes if env is not ready immediately
const getAIClient = () => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("Configuration Error: API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// System instruction to guide the model's behavior
// Note: We strictly enforce JSON structure here because we cannot use responseSchema when using googleSearch tool.
const systemInstruction = `You are an expert fact-checker and news analyst. Your task is to analyze news content and classify it as "REAL" or "FAKE".
You have access to Google Search to verify claims against up-to-date sources. Use it to check the latest facts.

- For "REAL" news, the content should be factually accurate, from a reputable source, and written in a neutral, objective tone.
- For "FAKE" news, look for signs like sensationalism, emotional manipulation, lack of credible sources, unverifiable claims, and biased language.

CRITICAL OUTPUT FORMAT:
Your response must be a single, valid JSON object.
Do NOT include any markdown code blocks (no \`\`\`json).
Do NOT include any text before or after the JSON.

Expected JSON Structure:
{
  "classification": "REAL" | "FAKE",
  "confidence": number, // 0 to 100
  "explanation": "string" // concise markdown-formatted explanation
}`;

// Retry helper for transient errors
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0) {
      const isRetryable =
        (error.message && (
          error.message.includes('503') ||
          error.message.includes('429') ||
          error.message.includes('overloaded') ||
          error.message.includes('resource_exhausted')
        )) ||
        error.status === 503 ||
        error.status === 429;
      
      if (isRetryable) {
        console.warn(`API call failed with transient error. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryOperation(operation, retries - 1, delay * 2);
      }
    }
    throw error;
  }
}

export const analyzeNews = async (input: string, mode: AnalysisMode): Promise<AnalysisResult> => {
  try {
    const ai = getAIClient();
    const userContent = mode === 'TEXT'
      ? `Analyze the following news article text:\n\n---\n${input}\n---\n\nRespond with valid JSON only.`
      : `Analyze the following news article URL. Assess its likely authenticity based on the source domain and headline. Acknowledge that you cannot directly access the URL's content, but provide an educated assessment based on this metadata and search results.\n\n---\n${input}\n---\n\nRespond with valid JSON only.`;

    // Wrap the API call in the retry logic
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable search grounding
        temperature: 0.1, // Lower temperature to increase determinism for JSON
      },
    }));

    if (!response || !response.text) {
         // Check if the response was blocked due to safety settings
         if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason !== 'STOP') {
             throw new Error(`Safety Violation: Analysis blocked by AI safety filters. Reason: ${response.candidates[0].finishReason}`);
         }
         throw new Error("API Error: The AI model returned an empty response. Please try again.");
    }

    let jsonString = response.text || "";

    // Robust JSON extraction: Find the first '{' and last '}'
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // Extract the potential JSON substring
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    } else {
        // Fallback: If no braces found, clean up markdown just in case it's a weird edge case,
        // though usually no braces means it's just text.
        jsonString = jsonString.trim();
        if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
    }

    let parsedResult: AnalysisResult;
    try {
        parsedResult = JSON.parse(jsonString) as AnalysisResult;
    } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError);
        console.log("Raw Response:", response.text);
        throw new Error("Parsing Error: Failed to process the AI's response. The model may have returned invalid data.");
    }

    // Extract Grounding Metadata (Sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: { title: string, url: string }[] = [];
    
    if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({ title: chunk.web.title, url: chunk.web.uri });
            }
        });
    }

    // Attach sources to the result
    parsedResult.sources = sources;

    // Validate the received data
    if (!Object.values(Classification).includes(parsedResult.classification)) {
      throw new Error('Validation Error: Invalid classification received from API.');
    }
    if (typeof parsedResult.confidence !== 'number' || parsedResult.confidence < 0 || parsedResult.confidence > 100) {
      throw new Error('Validation Error: Invalid confidence score received from API.');
    }
     if (typeof parsedResult.explanation !== 'string') {
        throw new Error('Validation Error: Invalid explanation format received from API.');
    }

    return parsedResult;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    const rawMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

    // If the error already has a Title: prefix (from our own throws above), rethrow it.
    if (error.message && error.message.includes(': ')) {
        throw error;
    }

    // Map common API errors to user-friendly messages with Title: Description format
    if (rawMessage.includes('401') || rawMessage.includes('api key not valid') || rawMessage.includes('unauthenticated')) {
        throw new Error("Authentication Error: The API key is invalid or missing. Please check your configuration.");
    }
    if (rawMessage.includes('403') || rawMessage.includes('permission_denied')) {
        throw new Error("Access Denied: Your API key does not have permission to access the Gemini API, or billing is not enabled.");
    }
    if (rawMessage.includes('429') || rawMessage.includes('resource_exhausted') || rawMessage.includes('quota')) {
        throw new Error("Rate Limit Exceeded: We are sending too many requests to the AI. Please wait a moment and try again.");
    }
    if (rawMessage.includes('500') || rawMessage.includes('internal')) {
        throw new Error("Server Error: Google's AI service is experiencing internal issues. Please try again later.");
    }
    if (rawMessage.includes('503') || rawMessage.includes('unavailable') || rawMessage.includes('overloaded')) {
        throw new Error("Service Unavailable: The AI model is currently overloaded. Please try again in a few seconds.");
    }
    if (rawMessage.includes('fetch failed')) {
        throw new Error("Network Error: Could not connect to the API. Please check your internet connection.");
    }
    if (rawMessage.includes('safety') || rawMessage.includes('blocked')) {
         throw new Error("Safety Violation: The content was flagged by safety filters and cannot be analyzed.");
    }

    throw new Error(`Unexpected Error: ${error instanceof Error ? error.message : "An unknown error occurred while analyzing the news."}`);
  }
};
