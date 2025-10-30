"use client";
import { useEffect, useMemo, useState } from "react";
import WelcomeModal from "@/components/onboarding/WelcomeModal";
import { getRole, getSelectedCourses } from "@/lib/user/prefs";
import { getCoursesRepo } from "@/lib/courses/repo";
import type { Course } from "@/lib/courses/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [role, setRoleState] = useState<"student" | "professor" | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    const r = getRole();
    const s = getSelectedCourses();
    setRoleState(r);
    setSelected(s);
    if (!r) setOpen(true);
    getCoursesRepo().listAll().then(setAllCourses);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setRoleState(getRole());
    setSelected(getSelectedCourses());
  };

  const coursesToShow = useMemo(() => {
    if (role === "student" && selected.length > 0) {
      const set = new Set(selected);
      return allCourses.filter((c) => set.has(c.slug));
    }
    return allCourses;
  }, [role, selected, allCourses]);

  const showAddBanner = role === "student" && selected.length === 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-semibold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-600">Continue your learning journey</p>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Change courses
          </Button>
        </div>

        {showAddBanner && (
          <div className="mt-6">
            <Alert>
              <AlertTitle>Pick your course(s)</AlertTitle>
              <AlertDescription>
                Select the course you’re enrolled in so only relevant content appears here.
                <Button className="ml-3" size="sm" onClick={() => setOpen(true)}>
                  Add now
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {coursesToShow.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </section>

        <WelcomeModal open={open} onClose={handleClose} />
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const route =
    course.slug === "cs201"
      ? "/courses/cs201"
      : course.slug === "phys152"
      ? "/courses/physics-152"
      : course.slug === "cs101"
      ? "/courses/cs101"
      : course.slug === "cs301"
      ? "/courses/cs301"
      : "#";
  const canNavigate = route !== "#";
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-2 bg-blue-800" />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {course.code}: {course.title}
            </h3>
          </div>
          <span className="text-xs rounded-full px-2 py-1 bg-slate-100 text-slate-800">
            {course.level}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-600">by {course.instructor}</div>
        <p className="text-sm text-slate-700 mt-3 line-clamp-3">{course.description}</p>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Progress</span>
            <span>0%</span>
          </div>
          <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-blue-800" />
          </div>
          <div className="mt-2 text-xs text-slate-600">0 of {course.lessons} lessons completed</div>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{course.weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M4 4v15.5" />
              <path d="M20 4v13a2 2 0 0 1-2 2H6.5" />
            </svg>
            <span>{course.lessons} lessons</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <Button className="w-full bg-blue-800 hover:bg-blue-900" onClick={() => canNavigate && router.push(route)} disabled={!canNavigate}>
          Start Course
        </Button>
      </div>
    </div>
  );
}

