/**
 * Course schema types for research-driven content generation
 */

export type Bloom = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

export type Subunit = {
  subunitId: string;               // slug
  subunitTitle: string;
  targetLengthWords: number;       // default 800
  mustCover: string[];             // required concepts (from uploads)
  formulas: string[];              // LaTeX strings extracted
  examStyle: string[];             // names only from uploads
  bloom: Bloom[];
  tags: string[];
};

export type Unit = {
  unitId: string;
  unitTitle: string;
  order: number;
  learningObjectives: string[];    // concise bullets
  subunits: Subunit[];
};

export type CourseSchema = {
  courseId: string;                // "physics-152"
  title: string;
  term?: string;                   // "Fall 2025"
  notation: string[];              // SI, vector bold, ∇·E = ρ/ε0
  preferredSources: string[];      // domains to prioritize
  prohibitedTopics: string[];
  outline: Unit[];
  createdAt: string;               // ISO
  version: number;                 // increment on re-ingest
};

// Defaults for new course schemas
export const DEFAULT_NOTATION = [
  "SI units",
  "bold vectors",
  "∇·E = ρ/ε0",
  "E in V/m",
  "B in T"
];

export const DEFAULT_PREFERRED_SOURCES = [
  "openstax.org",
  "mit.edu",
  "stanford.edu",
  "nasa.gov",
  "nist.gov",
  "aps.org",
  "ieee.org"
];

export const DEFAULT_TARGET_LENGTH_WORDS = 800;

