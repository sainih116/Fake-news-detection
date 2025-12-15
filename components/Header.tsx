import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center space-x-4">
        <div className="bg-green-100 p-2 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-700 leading-tight">
            Fake News Detector
            </h1>
            <p className="text-gray-500 text-sm hidden md:block">
            AI-powered misinformation analysis and fact-checking.
            </p>
        </div>
      </div>
    </header>
  );
};