// FIX: Added implementation for the RefreshIcon SVG component.
import React from 'react';

export const RefreshIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4a12 12 0 0115.65 1.95M20 20a12 12 0 01-15.65-1.95" />
    </svg>
);
