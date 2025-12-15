// FIX: Updated AnalyzedArticle interface to allow for an 'undefined' analysis state, representing articles that have not yet been analyzed.
export enum Classification {
  REAL = 'REAL',
  FAKE = 'FAKE',
}

export interface AnalysisSource {
  title: string;
  url: string;
}

export interface AnalysisResult {
  classification: Classification;
  confidence: number;
  explanation: string;
  sources?: AnalysisSource[];
}

export type AnalysisMode = 'TEXT' | 'URL';

export interface NewsArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
    location?: string; // Added for local context
}

export interface AnalyzedArticle extends NewsArticle {
    analysis: AnalysisResult | null | undefined; // undefined: not yet analyzed, null: analysis in progress
}