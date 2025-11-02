import CourseShellClient from "@/components/course/CourseShellClient";
import type { CourseData } from "@/components/course/CourseShell";
import { getCourseMeta, getCourseIndex, getSubunitContent } from "@/lib/courses-resolver";

export default async function Phys152Page() {
  const slug = "phys152";
  const courseMeta = (await getCourseMeta(slug)) as {
    course?: { title?: string };
    title?: string;
  };
  const index = (await getCourseIndex(slug)) as
    | { units?: Array<{ id: string; title: string; subunits?: Array<{ id: string; title: string; file: string }> }> }
    | Array<{ id: string; title: string; subunits?: Array<{ id: string; title: string; file: string }> }>;

  // Map YAML-based index to CourseShell CourseData shape
  type UnitShape = { id?: string; title: string; subunits?: Array<{ id: string; title: string; file?: string }> };
  function hasUnits(x: unknown): x is { units: UnitShape[] } {
    return typeof x === 'object' && x !== null && 'units' in x;
  }
  const rawUnits: UnitShape[] = hasUnits(index) ? index.units ?? [] : (index as UnitShape[]);
  const units = rawUnits.map(
    (u: UnitShape, idx: number) => ({
      id: u.id ?? `unit${idx + 1}`,
      title: u.title,
    lessons: (u.subunits ?? []).map((s: { id: string; title: string }) => ({
      id: s.id,
      title: s.title,
      description: "",
    })),
  }));

  const courseData: CourseData = {
    title: courseMeta?.course?.title ?? courseMeta?.title ?? "Physics 152",
    units,
  };

  // Preload subunit content keyed by subunit id
  const contentMap: Record<string, string> = {};
  for (const u of rawUnits) {
    const unitId = u.id;
    for (const s of u.subunits ?? []) {
      try {
        if (!unitId) {
          contentMap[s.id] = "";
          continue;
        }
        const raw = await getSubunitContent(slug, unitId, s.file ?? s.id);
        contentMap[s.id] = raw as string;
      } catch {
        contentMap[s.id] = "";
      }
    }
  }

  return <CourseShellClient courseData={courseData} contentMap={contentMap} courseShort="Physics 152" />;
}
