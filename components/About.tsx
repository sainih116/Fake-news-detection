
import React, { useState } from 'react';
import { GitHubIcon } from './icons/GitHubIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';

export const About: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b border-gray-100 pb-4">About the Creator</h2>
      <div className="flex flex-col items-center text-center">
        <div className="relative group mb-4">
            {/* Decorative background blur - Soft Blue/Slate for Academic feel */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-100 to-slate-200 rounded-full opacity-70 blur-md transition duration-500"></div>
            
            {!imageError ? (
                <img 
                    src="https://github.com/sainih116.png" 
                    alt="Harshit Saini" 
                    className="relative w-40 h-40 rounded-full object-cover object-center shadow-lg border-[3px] border-blue-50 filter brightness-105 contrast-105 saturate-[1.02] bg-gray-50"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="relative w-40 h-40 rounded-full bg-slate-50 flex items-center justify-center shadow-inner border-[3px] border-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mt-2">Harshit Saini</h3>
        <p className="text-sm font-semibold text-blue-600 mb-4 tracking-wide uppercase">Full Stack Developer</p>
        
        <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto mb-6">
            A passionate developer bridging the gap between AI and reliable information. This Fake News Detector is an academic initiative to combat misinformation using advanced Gemini models.
        </p>
        
        <div className="flex space-x-6">
            <a href="https://github.com/sainih116" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-gray-400 hover:text-gray-900 transition-transform hover:scale-110 duration-200">
                <GitHubIcon />
            </a>
            <a href="https://www.linkedin.com/in/harshit-saini-272107235" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-gray-400 hover:text-blue-700 transition-transform hover:scale-110 duration-200">
                <LinkedInIcon />
            </a>
        </div>
      </div>
    </div>
  );
};
