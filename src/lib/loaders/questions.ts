import fs from 'node:fs';
import path from 'node:path';

export type Question = {
  id: string;
  unit: string;
  subunit: string;
  type: 'mcq' | 'short' | 'code' | 'trace';
  stem: string;
  choices?: string[] | null;
  answer: string;
  explanation: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
};

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'questions.jsonl');

export function loadQuestions(): Question[] {
  try {
    const text = fs.readFileSync(DATA_PATH, 'utf8');
    const items = text
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return items as Question[];
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export function sampleQuestions(filter: Partial<Question> & { n?: number; tags?: string[] }): Question[] {
  const all = loadQuestions();
  const { unit, subunit, tags, n = 5 } = filter;
  
  let pool = all;
  
  if (unit) pool = pool.filter(q => q.unit === unit);
  if (subunit) pool = pool.filter(q => q.subunit === subunit);
  if (tags && tags.length) {
    pool = pool.filter(q => q.tags?.some(t => tags.includes(t)));
  }
  
  // Simple shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  
  return pool.slice(0, n);
}
