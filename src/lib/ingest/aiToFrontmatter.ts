/**
 * AI Adapter: Convert AI-generated course content to unified frontmatter format
 * This ensures all courses (AI-generated or manually created) follow the same structure
 */

type RawUnit = {
  number?: number;
  title?: string;
  summary?: string;
  learningObjectives?: string[];
  keyTerms?: string[];
  sections?: RawSection[];
};

type RawSection = {
  id?: string;
  slug?: string;
  title?: string;
  intro?: string;
  readings?: Array<{ title?: string; href?: string }>;
  note?: string;
  example?: string;
  assessments?: Array<{
    id?: string;
    prompt?: string;
    answer?: string;
    type?: string;
  }>;
};

type RawLesson = {
  slug?: string;
  unitNumber?: number;
  title?: string;
  keyConcepts?: {
    overview?: string;
    bullets?: string[];
  };
  practice?: string[];
  checks?: Array<{
    id?: string;
    prompt?: string;
    answer?: string;
    type?: string;
  }>;
};

type RawCourse = {
  id?: string;
  title?: string;
  description?: string;
  units?: RawUnit[];
  lessons?: RawLesson[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function aiToFrontmatter(raw: RawCourse) {
  const courseId = raw.id ?? slugify(raw.title ?? "course");
  
  const units = (raw.units ?? []).map((u: RawUnit, i: number) => ({
    number: Number(u.number ?? i + 1),
    title: String(u.title ?? `Unit ${i + 1}`),
    summary: u.summary ?? "",
    learningObjectives: u.learningObjectives ?? [],
    keyTerms: u.keyTerms ?? [],
    sections: (u.sections ?? []).map((s: RawSection, j: number) => {
      const slug = s.slug ?? slugify(s.title ?? `section-${i + 1}-${j + 1}`);
      return {
        id: s.id ?? `${i + 1}.${j + 1}`,
        slug,
        title: s.title ?? `Section ${i + 1}.${j + 1}`,
        intro: s.intro ?? "",
        readings: (s.readings ?? []).map((r) => ({
          title: r.title ?? "",
          href: r.href,
        })),
        note: s.note ?? "",
        example: s.example ?? "",
        assessments: (s.assessments ?? []).map((a, k: number) => ({
          id: a.id ?? `${slug}-q${k + 1}`,
          prompt: a.prompt ?? "",
          answer: a.answer ?? "",
          type: a.type ?? "short",
        })),
      };
    }),
  }));

  // Optional lesson metadata
  const lessons = (raw.lessons ?? []).map((l: RawLesson) => ({
    slug: l.slug ?? slugify(l.title ?? "lesson"),
    unitNumber: Number(l.unitNumber ?? 1),
    title: l.title ?? "",
    keyConcepts: {
      overview: l.keyConcepts?.overview ?? "",
      bullets: l.keyConcepts?.bullets ?? [],
    },
    practice: l.practice ?? [],
    checks: (l.checks ?? []).map((c, i: number) => ({
      id: c.id ?? `c${i + 1}`,
      prompt: c.prompt ?? "",
      answer: c.answer ?? "",
      type: c.type ?? "short",
    })),
  }));

  return {
    id: courseId,
    title: raw.title ?? "Untitled Course",
    description: raw.description ?? "",
    units,
    lessons,
  };
}

