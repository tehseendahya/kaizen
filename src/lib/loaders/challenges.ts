import fs from 'node:fs';
import path from 'node:path';

export type Challenge = {
  id: string;
  unit: string;
  subunit: string;
  title: string;
  prompt: string;
  steps: string[];
  solution: string;
  rubric: string;
  tags: string[];
};

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'challenges.jsonl');

export function loadChallenges(): Challenge[] {
  try {
    const text = fs.readFileSync(DATA_PATH, 'utf8');
    const items = text
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return items as Challenge[];
  } catch (error) {
    console.error('Error loading challenges:', error);
    return [];
  }
}

export function sampleChallenges(filter: Partial<Challenge> & { tags?: string[] }): Challenge[] {
  const all = loadChallenges();
  const { unit, subunit, tags } = filter;
  
  let pool = all;
  
  if (unit) pool = pool.filter(c => c.unit === unit);
  if (subunit) pool = pool.filter(c => c.subunit === subunit);
  if (tags && tags.length) {
    pool = pool.filter(c => c.tags?.some(t => tags.includes(t)));
  }
  
  // Return one random challenge
  if (pool.length === 0) return [];
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return [pool[randomIndex]];
}



