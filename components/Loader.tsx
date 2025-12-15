
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
