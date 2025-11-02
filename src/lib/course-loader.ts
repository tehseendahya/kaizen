import fs from "fs";
import path from "path";
import YAML from "yaml";

const ROOT = path.join(process.cwd(), "src/content/courses");

function safeExists(p: string) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function contentFolderExists(slug: string) {
  return safeExists(path.join(ROOT, slug));
}

export function readCourseYaml(slug: string) {
  const p = path.join(ROOT, slug, "course.yaml");
  return YAML.parse(fs.readFileSync(p, "utf8"));
}

export function readIndexYaml(slug: string) {
  const p = path.join(ROOT, slug, "index.yaml");
  return YAML.parse(fs.readFileSync(p, "utf8"));
}

export function readUnitYaml(slug: string, unitId: string) {
  const p = path.join(ROOT, slug, "units", unitId, "unit.yaml");
  return YAML.parse(fs.readFileSync(p, "utf8"));
}

export function readSubunitMdx(slug: string, unitId: string, file: string) {
  const p = path.join(ROOT, slug, "units", unitId, file);
  return fs.readFileSync(p, "utf8");
}

