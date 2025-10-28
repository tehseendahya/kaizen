"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { allCourses, loadSelectedCourses, saveSelectedCourses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import EditCoursesModal from "@/components/EditCoursesModal";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(loadSelectedCourses());
  }, []);

  const selectedCourses = useMemo(() => {
    const set = new Set(selected);
    return allCourses.filter((c) => set.has(c.slug));
  }, [selected]);

  const onSave = (slugs: string[]) => {
    setSelected(slugs);
    saveSelectedCourses(slugs);
  };

  const isActive = (href: string) => pathname === href;
  const activeCourse = (slug: string) => pathname?.startsWith(`/courses/${slug}`);

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 border-r border-slate-200 bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto p-4">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600" />
          <span className="font-semibold text-slate-900">Axis</span>
        </div>

        <nav className="space-y-6 text-sm">
          <div>
            <div className="mb-2 px-2 text-xs font-medium text-slate-500">Main</div>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className={navItem(isActive("/"))}
                >
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <a className={navItem(false)} aria-disabled title="Coming soon" role="link" onClick={(e)=>e.preventDefault()}>
                  Your Library
                </a>
              </li>
              <li>
                <a className={navItem(false)} aria-disabled title="Coming soon" onClick={(e)=>e.preventDefault()}>
                  <span className="flex items-center gap-2">Notifications <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-medium text-white">3</span></span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-2 px-2 text-xs font-medium text-slate-500">Your Courses</div>
            <ul className="space-y-1">
              {selectedCourses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className={navItem(Boolean(activeCourse(c.slug)))}>
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${c.color}`} />
                    <span className="truncate">{c.code}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>
                  + New Course
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-2 px-2 text-xs font-medium text-slate-500">Study Tools</div>
            <ul className="space-y-1">
              {['Flashcards','Study Guides','Practice Tests','AI Tutor'].map((label) => (
                <li key={label}>
                  <a className={navItem(false)} aria-disabled title="Coming soon" onClick={(e)=>e.preventDefault()}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <EditCoursesModal
          open={open}
          onOpenChange={setOpen}
          selected={selected}
          onSave={onSave}
        />
      </div>
    </aside>
  );
}

function navItem(active: boolean) {
  return [
    "flex items-center gap-2 rounded-lg px-3 py-2 transition",
    active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50",
  ].join(" ");
}

