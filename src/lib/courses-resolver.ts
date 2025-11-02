import { contentFolderExists, readCourseYaml, readIndexYaml, readUnitYaml, readSubunitMdx } from "./course-loader";
import { AVAILABLE_COURSES } from "@/data/courses";

// Types for YAML-backed course content
type SubunitYaml = { id: string; title: string; file: string; content?: string };
type UnitYaml = { id: string; title: string; subunits?: SubunitYaml[] };
type IndexYaml = { units: UnitYaml[] };
type CourseYaml = { course?: { title?: string } } & Record<string, unknown>;

export async function getCourseMeta(slug: string): Promise<CourseYaml | undefined> {
  if (contentFolderExists(slug)) return readCourseYaml(slug);
  return AVAILABLE_COURSES.find((c) => c.slug === slug);
}

export async function getCourseIndex(slug: string): Promise<IndexYaml | UnitYaml[]> {
  if (contentFolderExists(slug)) return readIndexYaml(slug);
  const legacy = AVAILABLE_COURSES.find((c) => c.slug === slug) as
    | { units?: UnitYaml[] }
    | undefined;
  return legacy?.units ?? [];
}

export async function getUnitMeta(slug: string, unitId: string): Promise<UnitYaml | undefined> {
  if (contentFolderExists(slug)) return readUnitYaml(slug, unitId);
  const legacy = AVAILABLE_COURSES.find((c) => c.slug === slug) as
    | { units?: UnitYaml[] }
    | undefined;
  return legacy?.units?.find((u) => u.id === unitId);
}

export async function getSubunitContent(slug: string, unitId: string, fileOrId: string): Promise<string> {
  if (contentFolderExists(slug)) return readSubunitMdx(slug, unitId, fileOrId);
  const legacy = AVAILABLE_COURSES.find((c) => c.slug === slug) as
    | { units?: UnitYaml[] }
    | undefined;
  const unit = legacy?.units?.find((u) => u.id === unitId);
  const sub = unit?.subunits?.find((s) => s.file === fileOrId || s.id === fileOrId);
  return sub?.content ?? "";
}
