export type AxisRole = "student" | "professor" | null;

const ROLE_KEY = "axis:role";
const COURSES_KEY = "axis:selectedCourses";

export const getRole = (): AxisRole =>
  typeof window === "undefined" ? null : ((localStorage.getItem(ROLE_KEY) as AxisRole) ?? null);

export const setRole = (role: Exclude<AxisRole, null>) => {
  if (typeof window !== "undefined") localStorage.setItem(ROLE_KEY, role);
};

export const getSelectedCourses = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COURSES_KEY) || "[]");
  } catch {
    return [];
  }
};

export const setSelectedCourses = (slugs: string[]) => {
  if (typeof window !== "undefined") {
    // Allow unlimited selections; persist unique list as-is
    const unique = Array.from(new Set(slugs));
    localStorage.setItem(COURSES_KEY, JSON.stringify(unique));
  }
};
