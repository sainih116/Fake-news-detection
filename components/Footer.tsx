import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 shadow-inner">
      <div className="container mx-auto px-4 md:px-8 py-4 text-center text-gray-500">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Harshit Saini. All Rights Reserved.
        </p>
        <p className="text-xs mt-1 font-semibold text-gray-400 uppercase tracking-wider">
          A Harshit Saini Halmark Project
        </p>
      </div>
    </footer>
  );
};