import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { AnalysisMode } from '../types';

interface NewsAnalyzerProps {
  onAnalyze: (input: string, mode: AnalysisMode) => void;
  isLoading: boolean;
}

const FileTextIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const LinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>
);

export const NewsAnalyzer: React.FC<NewsAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [mode, setMode] = useState<AnalysisMode>('TEXT');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const input = mode === 'TEXT' ? text : url;
  const isInputEmpty = !input.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInputEmpty) {
      onAnalyze(input, mode);
    }
  };
  
  const TabButton: React.FC<{
    label: string, 
    targetMode: AnalysisMode,
    children: React.ReactNode
    }> = ({ label, targetMode, children }) => {
    const isActive = mode === targetMode;
    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setMode(targetMode)}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {children}
            {label}
        </button>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Analyze News</h2>
      
      <div className="flex p-1 bg-gray-200 rounded-lg mb-4" role="tablist">
        <TabButton label="By Text" targetMode="TEXT"><FileTextIcon /></TabButton>
        <TabButton label="By URL" targetMode="URL"><LinkIcon /></TabButton>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'TEXT' ? (
          <div role="tabpanel">
            <label htmlFor="text-input" className="sr-only">Paste a headline or the full article text below.</label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., A new study reveals surprising benefits of chocolate..."
              className="w-full h-64 p-4 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200 resize-none disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div role="tabpanel">
            <label htmlFor="url-input" className="sr-only">Enter a URL to a news article.</label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://www.example.com/news/article"
              className="w-full p-4 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || isInputEmpty}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            'Analyzing...'
          ) : (
            <>
              <SparklesIcon />
              Analyze
            </>
          )}
        </button>
      </form>
    </div>
  );
};