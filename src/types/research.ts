/**
 * Research and content generation types
 */

export type ResearchNote = {
  url: string;
  title: string;
  publisher?: string;
  date?: string;
  quality: number;                 // 0..1 score
  claims: string[];                // declarative, source-verifiable
  equations: string[];             // LaTeX
  examples: string[];              // 1-3 outlines
  hash: string;                    // content hash for dedupe
};

export type Bibliography = Array<Pick<ResearchNote, "url" | "title" | "publisher" | "date" | "quality">>;

export type SearchDepth = "standard" | "deep";

export type GenerationStatus = 
  | "queued" 
  | "researching" 
  | "composing" 
  | "qa" 
  | "published" 
  | "failed" 
  | "research_unavailable";

export type QAResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    coverage: boolean;
    sources: boolean;
    citations: boolean;
    originality: boolean;
    length: boolean;
    structure: boolean;
    math: boolean;
    a11y: boolean;
    notation: boolean;
    links: boolean;
    style: boolean;
    security: boolean;
  };
};

export type GenerationLog = {
  id: string;
  courseId: string;
  unitId: string;
  subunitId: string;
  status: GenerationStatus;
  depth: SearchDepth;
  startedAt: string;
  completedAt?: string;
  searchedCount: number;
  keptCount: number;
  filteredSources: string[];
  qaResult?: QAResult;
  wordCount?: number;
  errorMessage?: string;
};

