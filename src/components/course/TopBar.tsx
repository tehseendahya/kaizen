"use client";
import { useState } from "react";
import { getCourseBySlug } from "@/lib/courses";
import { axis } from "@/lib/theme";
import CourseSwitcher from "@/components/course/CourseSwitcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CourseSidebar from "@/components/course/CourseSidebar";

export default function TopBar({ slug }: { slug: string }) {
  const course = getCourseBySlug(slug);
  const [open, setOpen] = useState(false);
  const isCS201 = slug === "cs201";
  return (
    <header className={isCS201 ? "sticky top-0 z-30 bg-white/90 backdrop-blur border-b" : "border-b bg-white"}>
      <div className={isCS201 ? `h-16 flex items-center justify-between ${axis.container}` : "h-16 px-6 flex items-center justify-between"}>
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" className={isCS201 ? `${axis.link} text-sm flex items-center gap-2 shrink-0` : "text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 shrink-0"}>
            <span className="-rotate-180">➜</span> All Courses
          </a>
          <div className="h-4 w-px bg-gray-200" />
          <h1 className={isCS201 ? "truncate text-[15px] font-semibold text-gray-900" : "truncate font-semibold"} data-course-title>{course.title}</h1>
          <span className={isCS201 ? `${axis.meta} ml-2 shrink-0` : "text-xs text-gray-500 ml-2 shrink-0"} data-course-meta>{course.meta}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="md:hidden" onClick={() => setOpen(true)}>Outline</Button>
          <CourseSwitcher currentSlug={slug} />
        </div>
      </div>

      {/* Drawer (dialog) for mobile outline */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Course Outline</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <CourseSidebar slug={slug} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
