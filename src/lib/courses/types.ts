export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type Course = {
  slug: "cs201" | "phys152" | "cs101" | "cs301";
  code: string;
  title: string;
  level: CourseLevel;
  lessons: number;
  weeks: number;
  instructor: string;
  description: string;
};

