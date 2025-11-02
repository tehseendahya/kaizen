import { contentFolderExists, readCourseYaml, readIndexYaml, readUnitYaml, readSubunitMdx } from "./course-loader";
import { AVAILABLE_COURSES } from "@/data/courses";

export async function getCourseMeta(slug: string) {
  if (contentFolderExists(slug)) return readCourseYaml(slug);
  return AVAILABLE_COURSES.find((c) => c.slug === slug);
}

export async function getCourseIndex(slug: string) {
  if (contentFolderExists(slug)) return readIndexYaml(slug);
  const legacy: any = AVAILABLE_COURSES.find((c) => c.slug === slug);
  return legacy?.units ?? [];
}

export async function getUnitMeta(slug: string, unitId: string) {
  if (contentFolderExists(slug)) return readUnitYaml(slug, unitId);
  const legacy: any = AVAILABLE_COURSES.find((c) => c.slug === slug);
  return legacy?.units?.find((u: any) => u.id === unitId);
}

export async function getSubunitContent(slug: string, unitId: string, fileOrId: string) {
  if (contentFolderExists(slug)) return readSubunitMdx(slug, unitId, fileOrId);
  const legacy: any = AVAILABLE_COURSES.find((c) => c.slug === slug);
  const unit = legacy?.units?.find((u: any) => u.id === unitId);
  const sub = unit?.subunits?.find((s: any) => s.file === fileOrId || s.id === fileOrId);
  return sub?.content ?? "";
}

