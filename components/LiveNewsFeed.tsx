// FIX: Implemented the LiveNewsFeed component to resolve errors and display news articles for analysis.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchNews } from '../services/newsApiService';
import type { AnalyzedArticle, NewsArticle } from '../types';
import { ImagePlaceholderIcon } from './icons/ImagePlaceholderIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ResultDisplay } from './ResultDisplay';

interface LiveNewsFeedProps {
  analyzedArticles: AnalyzedArticle[];
  setAnalyzedArticles: (articles: AnalyzedArticle[] | ((prev: AnalyzedArticle[]) => AnalyzedArticle[])) => void;
  onAnalyzeArticle: (article: AnalyzedArticle) => void;
}

const newsCategories = ['general', 'business', 'technology', 'sports', 'health', 'entertainment'];

// Helper to calculate "X time ago"
const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const ArticleCard: React.FC<{ article: AnalyzedArticle; onAnalyze: (article: AnalyzedArticle) => void; }> = ({ article, onAnalyze }) => {
    
  let actionContent;
  if (article.analysis === undefined) {
    // State 1: Not yet analyzed. Show the "Analyze" button.
    actionContent = (
      <button
        onClick={() => onAnalyze(article)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-green-700 border border-green-600 font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors duration-300 text-sm"
      >
        <SparklesIcon /> Verify Authenticity
      </button>
    );
  } else if (article.analysis === null) {
    // State 2: Analysis is in progress. Show a loading indicator.
    actionContent = (
      <div className="flex items-center gap-2 text-gray-500 font-medium py-2 px-1 text-sm bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
        <span>Verifying news authenticity...</span>
      </div>
    );
  } else {
    // State 3: Analysis is complete. Show the results.
    actionContent = (
      <div className="mt-3">
        <ResultDisplay result={article.analysis} />
      </div>
    );
  }

  return (
    <li className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md flex flex-col md:flex-row group">
      {/* Image Section */}
      <div className="md:w-1/3 h-52 md:h-auto relative overflow-hidden">
        {article.urlToImage ? (
          <img 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
            src={article.urlToImage} 
            alt={article.title} 
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <ImagePlaceholderIcon />
          </div>
        )}
        {/* Source Badge on Image */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
             {article.source.name}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 md:w-2/3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
             {article.location && (
                 <>
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {article.location}
                    </span>
                    <span>&bull;</span>
                 </>
             )}
             <span>{getTimeAgo(article.publishedAt)}</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-green-700 transition-colors">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
            </a>
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {article.description}
          </p>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
             <div className="w-full">
                 {actionContent}
             </div>
        </div>
      </div>
    </li>
  );
};


export const LiveNewsFeed: React.FC<LiveNewsFeedProps> = ({ analyzedArticles, setAnalyzedArticles, onAnalyzeArticle }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  type StatusFilter = 'ALL' | 'ANALYZED' | 'NOT_ANALYZED';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [maxConfidence, setMaxConfidence] = useState<number>(100);

  const loadNews = useCallback(async (category: string) => {
    setIsLoading(true);
    setSourceFilter('ALL');
    
    try {
      // The fetchNews service now only returns mock data and no longer throws errors.
      const { articles: newsArticles } = await fetchNews(category);
      
      setAnalyzedArticles(prevAnalyzed => {
        // Create a map of existing analyses based on URL to preserve state
        const existingAnalysisMap = new Map(prevAnalyzed.map(a => [a.url, a.analysis]));

        return newsArticles.map(article => ({
            ...article,
            // If we have analyzed this article (by URL) before, keep the analysis status
            analysis: existingAnalysisMap.has(article.url) ? existingAnalysisMap.get(article.url) : undefined
        }));
      });

    } catch (err) {
      console.error("An unexpected error occurred:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setAnalyzedArticles]);

  useEffect(() => {
    loadNews(selectedCategory);
  }, [loadNews, selectedCategory]);

  const uniqueSources = useMemo(() => {
    const sources = new Set(analyzedArticles.map(article => article.source.name));
    return ['ALL', ...Array.from(sources).sort()];
  }, [analyzedArticles]);

  const filteredArticles = useMemo(() => {
    return analyzedArticles.filter(article => {
      // 1. Source Filter
      if (sourceFilter !== 'ALL' && article.source.name !== sourceFilter) return false;

      // 2. Status Filter
      const isAnalyzed = article.analysis !== undefined && article.analysis !== null;
      if (statusFilter === 'ANALYZED' && !isAnalyzed) return false;
      if (statusFilter === 'NOT_ANALYZED' && isAnalyzed) return false;

      // 3. Keyword Filter (Title)
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        if (!article.title.toLowerCase().includes(keyword)) return false;
      }

      // 4. Date Range Filter
      if (startDate || endDate) {
        const articleDate = new Date(article.publishedAt);
        if (startDate && articleDate < new Date(startDate)) return false;
        
        if (endDate) {
          // Set end date time to end of day
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          if (articleDate > endDateTime) return false;
        }
      }

      // 5. Confidence Score Filter (only applies if article is analyzed)
      if (article.analysis) {
        const score = article.analysis.confidence;
        if (score < minConfidence || score > maxConfidence) return false;
      }

      return true;
    });
  }, [analyzedArticles, sourceFilter, statusFilter, searchKeyword, startDate, endDate, minConfidence, maxConfidence]);
  
  const formatStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  }

  const resetFilters = () => {
    setSourceFilter('ALL');
    setStatusFilter('ALL');
    setSearchKeyword('');
    setStartDate('');
    setEndDate('');
    setMinConfidence(0);
    setMaxConfidence(100);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Live Feed
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </h2>
            <p className="text-gray-500 text-sm">Real-time headlines from trusted sources</p>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={() => loadNews(selectedCategory)}
                disabled={isLoading}
                className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:text-green-700 hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Refresh news feed"
            >
              <RefreshIcon />
              <span className="font-medium">Refresh Feed</span>
            </button>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {newsCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === category
                    ? 'bg-green-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
          ))}
        </div>
      </div>
      
      {!isLoading && analyzedArticles.length > 0 && (
        <div className="mb-8 bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Filter & Search</h3>
                <button onClick={resetFilters} className="text-xs text-green-600 font-medium hover:underline">Reset All</button>
            </div>
            {/* Top Row: Keywords and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Search headlines..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                    />
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                 <div>
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm bg-gray-50 focus:bg-white"
                    >
                        {uniqueSources.map(source => (
                            <option key={source} value={source}>
                            {source === 'ALL' ? 'All Publishers' : source}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['ALL', 'ANALYZED', 'NOT_ANALYZED'] as const).map(status => (
                        <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            statusFilter === status ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        >
                        {formatStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {isLoading && (
         <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-500 animate-pulse">Fetching latest headlines...</p>
         </div>
      )}
      
      {!isLoading && (
        <>
        {filteredArticles.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard key={article.url} article={article} onAnalyze={onAnalyzeArticle} />
            ))}
          </ul>
        ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">No articles match your criteria</h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto">Try adjusting your search terms or filters to find what you're looking for.</p>
              <button 
                onClick={resetFilters}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
              >
                Clear Filters
              </button>
            </div>
        )}
        </>
      )}
    </div>
  );
};
