import type { Course } from "./types";

export interface CoursesRepo {
  listAll(): Promise<Course[]>;
  findBySlugs(slugs: string[]): Promise<Course[]>;
}

class LocalCoursesRepo implements CoursesRepo {
  private dataPromise: Promise<Course[]>;
  constructor() {
    this.dataPromise = import("./courses.json").then((m) => m.default as Course[]);
  }
  async listAll(): Promise<Course[]> {
    return await this.dataPromise;
  }
  async findBySlugs(slugs: string[]): Promise<Course[]> {
    const all = await this.dataPromise;
    const set = new Set(slugs);
    return all.filter((c) => set.has(c.slug));
  }
}

// Swap to Supabase later by implementing CoursesRepo and changing this factory.
let singleton: CoursesRepo | null = null;
export function getCoursesRepo(): CoursesRepo {
  if (!singleton) singleton = new LocalCoursesRepo();
  return singleton;
}

