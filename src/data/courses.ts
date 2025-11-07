export type Course = {
  slug: string;
  code: string;
  title: string;
  weeks: number;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
};

export const AVAILABLE_COURSES: Course[] = [
  { slug: 'cs201', code: 'CS201', title: 'Data Structures & Algorithms', weeks: 12, lessons: 18, level: 'Intermediate' },
  { slug: 'phys152', code: 'PHYS152', title: 'Physics 152: Electricity & Magnetism', weeks: 14, lessons: 35, level: 'Intermediate' },
  { slug: 'cs101', code: 'CS101', title: 'Introduction to Programming', weeks: 8, lessons: 24, level: 'Beginner' },
  { slug: 'cs301', code: 'CS301', title: 'Software Engineering', weeks: 10, lessons: 16, level: 'Advanced' },
];

// Flat catalog for typeahead suggestions used in onboarding
export type CourseCatalogItem = {
  code: string;
  title: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  weeks?: number;
};

export const COURSE_CATALOG: CourseCatalogItem[] = [
  { code: 'CS201', title: 'Data Structures & Algorithms', level: 'Intermediate', weeks: 12 },
  { code: 'CS305', title: 'Machine Learning Fundamentals', level: 'Advanced', weeks: 14 },
  { code: 'MATH240', title: 'Linear Algebra', level: 'Intermediate', weeks: 10 },
  { code: 'PHYS152', title: 'Electricity & Magnetism', level: 'Intermediate', weeks: 14 },
  { code: 'CS101', title: 'Introduction to Programming', level: 'Beginner', weeks: 8 },
  { code: 'CS301', title: 'Software Engineering', level: 'Advanced', weeks: 10 },
  { code: 'STAT210', title: 'Probability & Statistics', level: 'Intermediate', weeks: 12 },
  { code: 'ECON101', title: 'Microeconomics', level: 'Beginner', weeks: 10 },
];
