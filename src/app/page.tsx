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
    <div className="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-600">{course.code}</div>
          <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
        </div>
        <span className="text-xs rounded-full px-2 py-1 bg-slate-100">{course.level}</span>
      </div>
      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between text-xs mt-4 text-slate-600">
        <div>{course.weeks} weeks</div>
        <div>{course.lessons} lessons</div>
      </div>
      <Button
        className="w-full mt-4"
        onClick={() => canNavigate && router.push(route)}
        disabled={!canNavigate}
      >
        Start Course
      </Button>
    </div>
  );
}
