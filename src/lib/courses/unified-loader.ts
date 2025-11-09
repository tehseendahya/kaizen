import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";

const ROOT = path.join(process.cwd(), "src/content/courses");

// Zod schema for runtime validation
const ReadingSchema = z.object({
  title: z.string(),
  href: z.string().optional(),
});

const AssessmentSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  answer: z.string().optional(),
  type: z.enum(["mcq", "short", "derivation", "calc"]).optional(),
});

const SectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  intro: z.string().optional(),
  readings: z.array(ReadingSchema).optional().default([]),
  note: z.string().optional().default(""),
  example: z.string().optional().default(""),
  assessments: z.array(AssessmentSchema).optional().default([]),
});

const UnitSchema = z.object({
  number: z.number(),
  title: z.string(),
  summary: z.string().optional().default(""),
  learningObjectives: z.array(z.string()).optional().default([]),
  keyTerms: z.array(z.string()).optional().default([]),
  sections: z.array(SectionSchema).optional().default([]),
});

const KeyConceptsSchema = z.object({
  overview: z.string(),
  bullets: z.array(z.string()).optional().default([]),
});

const CheckSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  answer: z.string().optional(),
  type: z.string().optional(),
});

const LessonSchema = z.object({
  slug: z.string(),
  unitNumber: z.number(),
  title: z.string(),
  keyConcepts: KeyConceptsSchema.optional(),
  practice: z.array(z.string()).optional().default([]),
  checks: z.array(CheckSchema).optional().default([]),
});

const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  units: z.array(UnitSchema).optional().default([]),
  lessons: z.array(LessonSchema).optional().default([]),
});

export type Course = z.infer<typeof CourseSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Reading = z.infer<typeof ReadingSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;

/**
 * Load and validate a course from YAML
 */
export function loadCourse(courseId: string): Course | null {
  const coursePath = path.join(ROOT, courseId, "course.yaml");
  
  if (!fs.existsSync(coursePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(coursePath, "utf8");
    const parsed = YAML.parse(content);
    
    // Handle both direct structure and nested under 'course' key
    let courseData = parsed.course ? { ...parsed.course, id: courseId } : { ...parsed, id: courseId };
    
    // If no units/lessons, provide empty arrays for graceful degradation
    if (!courseData.units) courseData.units = [];
    if (!courseData.lessons) courseData.lessons = [];
    
    // Validate with Zod
    const validated = CourseSchema.parse(courseData);
    return validated;
  } catch (error) {
    console.error(`Error loading course ${courseId}:`, error);
    return null;
  }
}

/**
 * Get all available course IDs
 */
export function getAllCourseIds(): string[] {
  if (!fs.existsSync(ROOT)) {
    return [];
  }

  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Get all courses
 */
export function getAllCourses(): Course[] {
  const ids = getAllCourseIds();
  return ids
    .map((id) => loadCourse(id))
    .filter((course): course is Course => course !== null);
}

