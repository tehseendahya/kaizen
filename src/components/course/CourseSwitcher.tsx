"use client";
import { useState } from "react";
import { COURSES } from "@/lib/courses";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CourseSwitcher({ currentSlug }: { currentSlug: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Switch Course</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a course</DialogTitle>
          </DialogHeader>
          <ul className="divide-y rounded-md border">
            {COURSES.map((c) => (
              <li key={c.slug}>
                <button
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 ${c.slug === currentSlug ? 'bg-slate-50' : ''}`}
                  onClick={() => { setOpen(false); router.push(`/courses/${c.slug}`); }}
                >
                  <span className="text-sm text-slate-900">{c.title}</span>
                  {c.slug === currentSlug && <span className="text-xs text-slate-500">Current</span>}
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

