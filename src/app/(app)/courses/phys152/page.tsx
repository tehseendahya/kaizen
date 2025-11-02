import CourseShellClient from "@/components/course/CourseShellClient";
import type { CourseData } from "@/components/course/CourseShell";
import { getCourseMeta, getCourseIndex, getSubunitContent } from "@/lib/courses-resolver";

export default async function Phys152Page() {
  const slug = "phys152";
  const courseMeta: any = await getCourseMeta(slug);
  const index: any = await getCourseIndex(slug);

  // Map YAML-based index to CourseShell CourseData shape
  const units = (index.units ?? index).map((u: any, idx: number) => ({
    id: u.id ?? `unit${idx + 1}`,
    title: u.title,
    lessons: (u.subunits ?? []).map((s: any) => ({
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
  for (const u of (index.units ?? index)) {
    for (const s of u.subunits ?? []) {
      try {
        const raw = await getSubunitContent(slug, u.id, s.file);
        contentMap[s.id] = raw as string;
      } catch {
        contentMap[s.id] = "";
      }
    }
  }

  return <CourseShellClient courseData={courseData} contentMap={contentMap} courseShort="Physics 152" />;
}
