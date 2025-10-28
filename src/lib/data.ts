export type Course = {
  slug: string;
  code: string;
  title: string;
  instructor: string;
  color: string; // tailwind bg color utility, e.g. 'bg-blue-500'
};

export type QuizPlanItem = {
  id: string;
  type: 'quiz';
  title: string;
  courseSlug: string;
  dueISO: string;
};

export type ModulePlanItem = {
  id: string;
  type: 'module';
  title: string;
  courseSlug: string;
  estMins: number;
};

export type ResearchPlanItem = {
  id: string;
  type: 'research';
  title: string;
  lab: string;
  deadlineISO: string;
};

export type PlanItem = QuizPlanItem | ModulePlanItem | ResearchPlanItem;

export const allCourses: Course[] = [
  { slug: 'cs201', code: 'CS201', title: 'Data Structures', instructor: 'Dr. Patel', color: 'bg-blue-500' },
  { slug: 'phys102l', code: 'PHYSICS 102L', title: 'Electromagnetism Lab', instructor: 'Prof. Kim', color: 'bg-purple-500' },
  { slug: 'psy101', code: 'PSY101', title: 'Intro to Psychology', instructor: 'Dr. Nguyen', color: 'bg-pink-500' },
  { slug: 'math201', code: 'MATH201', title: 'Calculus II', instructor: 'Dr. Li', color: 'bg-green-500' },
  { slug: 'hist150', code: 'HIST150', title: 'World History', instructor: 'Dr. Ahmed', color: 'bg-amber-500' },
  { slug: 'cs301', code: 'CS301', title: 'Algorithms', instructor: 'Dr. Romero', color: 'bg-indigo-500' },
  { slug: 'bio110', code: 'BIO110', title: 'General Biology', instructor: 'Dr. Miller', color: 'bg-teal-500' },
];

export const seededSelectedCourseSlugs: string[] = ['cs201', 'phys102l', 'psy101', 'math201', 'hist150'];

export const todayPlan: PlanItem[] = [
  { id: 'em-quiz', type: 'quiz', title: 'Physics 102L: Electromagnetism Quiz', courseSlug: 'phys102l', dueISO: new Date(Date.now() + 2 * 86400000).toISOString() },
  { id: 'bst-module', type: 'module', title: 'CS201: Binary Search Trees', courseSlug: 'cs201', estMins: 35 },
  { id: 'calc-integrals', type: 'module', title: 'MATH201: Techniques of Integration', courseSlug: 'math201', estMins: 25 },
  { id: 'ml-reading', type: 'research', title: 'Vector Fields in Practice', lab: 'AI Research Lab', deadlineISO: new Date(Date.now() + 5 * 86400000).toISOString() },
];

export const assistantInsights = {
  progress: { courseTitle: 'Physics', percent: 75 },
  recommendation: { topic: 'Vector Fields', href: '#' },
  streakDays: 5,
  tips: [
    'Take breaks every 25 minutes for better retention.',
    'Focus on one subject at a time to avoid context switching.',
  ],
};

// Persistence helpers for the sidebar course selection
const STORAGE_KEY = 'axis:courses';

export function loadSelectedCourses(): string[] {
  if (typeof window === 'undefined') return seededSelectedCourseSlugs;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seededSelectedCourseSlugs;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) && arr.length ? arr : seededSelectedCourseSlugs;
  } catch {
    return seededSelectedCourseSlugs;
  }
}

export function saveSelectedCourses(slugs: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

