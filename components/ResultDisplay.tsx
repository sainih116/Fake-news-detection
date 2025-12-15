import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { AnalysisResult } from '../types';
import { Classification } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { ShareIcon } from './icons/ShareIcon';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const ConfidenceBar: React.FC<{ confidence: number; color: string }> = ({ confidence, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={color} style={{ width: `${confidence}%`, height: '100%', borderRadius: 'inherit' }}></div>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isReal = result.classification === Classification.REAL;
  const colorClass = isReal ? 'text-green-600' : 'text-red-600';
  const bgColorClass = isReal ? 'bg-green-100' : 'bg-red-100';
  const confidenceColor = isReal ? 'bg-green-500' : 'bg-red-500';
  
  const rawMarkup = marked.parse(result.explanation || '');
  const sanitizedMarkup = DOMPurify.sanitize(rawMarkup as string);

  const handleShare = async () => {
    const shareText = `*Fake News Detector Analysis*\n\n*Classification:* ${result.classification}\n*Confidence:* ${result.confidence.toFixed(0)}%\n\n*Explanation:*\n${result.explanation}`;

    const shareData = {
      title: 'Fake News Analysis Result',
      text: shareText,
      url: window.location.href, // Or the URL of the article if available
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy results to clipboard.');
      }
    }
  };


  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`flex items-center gap-4 p-4 rounded-lg ${bgColorClass}`}>
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClass} bg-white shadow-md`}>
            {isReal ? <CheckIcon /> : <XIcon />}
        </div>
        <div>
          <p className={`text-2xl font-bold ${colorClass}`}>{result.classification}</p>
          <p className="text-sm text-gray-600">Confidence: {result.confidence.toFixed(0)}%</p>
        </div>
      </div>
      <ConfidenceBar confidence={result.confidence} color={confidenceColor} />

      <div>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Explanation</h3>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 font-medium py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Share analysis results"
          >
            {navigator.share ? 'Share' : (isCopied ? 'Copied!' : 'Copy Results')}
            <ShareIcon />
          </button>
        </div>
        <div 
          className="prose prose-sm mt-2 text-gray-600"
          dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
        />
      </div>

      {result.sources && result.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Sources & Citations
              </h4>
              <ul className="space-y-1">
                  {result.sources.map((source, index) => (
                      <li key={index} className="text-sm truncate">
                          <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline hover:text-green-800 transition-colors flex items-center gap-1"
                          >
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                              {source.title}
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};