// FIX: Added full implementation for the main App component to orchestrate the UI and manage state.
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { NewsAnalyzer } from './components/NewsAnalyzer';
import { ResultDisplay } from './components/ResultDisplay';
import { Dashboard } from './components/Dashboard';
import { Loader } from './components/Loader';
import { LiveNewsFeed } from './components/LiveNewsFeed';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { analyzeNews } from './services/geminiService';
import type { AnalysisResult, AnalysisMode, AnalyzedArticle } from './types';

const STORAGE_KEY = 'fake_news_analysis_history';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<AnalysisResult | null>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Initialize analysisHistory from localStorage
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        return savedHistory ? JSON.parse(savedHistory) : [];
      }
    } catch (e) {
      console.warn("Failed to load history from local storage. Clearing corrupted data.", e);
      // Attempt to clear bad data to prevent persistent errors
      try {
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    return [];
  });

  const [analyzedArticles, setAnalyzedArticles] = useState<AnalyzedArticle[]>([]);

  // Persist analysisHistory to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analysisHistory));
    } catch (e) {
      console.warn("Failed to save history to local storage", e);
    }
  }, [analysisHistory]);

  const handleAnalyze = async (input: string, mode: AnalysisMode) => {
    setIsLoading(true);
    setError(null);
    setLatestResult(null);

    try {
      const result = await analyzeNews(input, mode);
      setLatestResult(result);
      setAnalysisHistory(prevHistory => [result, ...prevHistory]);
      
      // Smoothly scroll to the result after a short delay to allow rendering
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // Scroll to error if it occurs
       setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeArticle = async (article: AnalyzedArticle) => {
    // Set analysis state to null to indicate loading
    setAnalyzedArticles(prev => prev.map(a => a.url === article.url ? { ...a, analysis: null } : a));
    setError(null); // Clear previous errors

    try {
        const result = await analyzeNews(article.title + '\n\n' + (article.description || article.content || ''), 'TEXT');
        setAnalyzedArticles(prev => prev.map(a => a.url === article.url ? { ...a, analysis: result } : a));
        setAnalysisHistory(prevHistory => [result, ...prevHistory]);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while analyzing the article.');
        // Revert the article state on error to allow retry
        setAnalyzedArticles(prev => prev.map(a => a.url === article.url ? { ...a, analysis: undefined } : a));
        // Scroll to error if it occurs (usually top of left column)
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  };
  
  // Helper to parse "Title: Message" format
  const getErrorContent = (errorMessage: string) => {
    const separatorIndex = errorMessage.indexOf(': ');
    if (separatorIndex !== -1 && separatorIndex < 50) { // Limit title length to avoid parsing random sentences
      return {
        title: errorMessage.substring(0, separatorIndex),
        message: errorMessage.substring(separatorIndex + 2)
      };
    }
    return {
      title: 'Analysis Error',
      message: errorMessage
    };
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <NewsAnalyzer onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
            {isLoading && <Loader />}
            
            {error && (
              <div ref={errorRef} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-start animate-fade-in shadow-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        {(() => {
                           const { title, message } = getErrorContent(error);
                           return (
                             <>
                                <h3 className="text-sm font-bold text-red-800">{title}</h3>
                                <p className="text-sm text-red-700 mt-1">{message}</p>
                             </>
                           );
                        })()}
                    </div>
                </div>
                <button 
                    onClick={() => setError(null)}
                    className="ml-auto pl-3 text-red-500 hover:text-red-700 focus:outline-none transition-colors"
                    aria-label="Dismiss error"
                >
                     <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                </button>
              </div>
            )}

            {latestResult && (
              <div ref={resultSectionRef} className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                 <h2 className="text-2xl font-bold text-gray-700 mb-4">Latest Analysis</h2>
                <ResultDisplay result={latestResult} />
              </div>
            )}
             <Contact />
             <About />
          </div>

          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-6 rounded-lg shadow-md">
                <LiveNewsFeed 
                    analyzedArticles={analyzedArticles}
                    setAnalyzedArticles={setAnalyzedArticles}
                    onAnalyzeArticle={handleAnalyzeArticle}
                />
            </div>
            {analysisHistory.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Dashboard history={analysisHistory} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;