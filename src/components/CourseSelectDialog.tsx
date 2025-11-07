"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AVAILABLE_COURSES } from '@/data/courses';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function CourseSelectDialog({ open, onOpenChange }: Props) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const router = useRouter();

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function onContinue() {
    if (selected.length === 0) return;
    try {
      localStorage.setItem('enrolledCourseSlugs', JSON.stringify(selected));
    } catch {}
    onOpenChange(false);
    router.push('/courses');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Select your courses</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">Pick the courses you’re currently enrolled in.</p>

        <div className="mt-3 max-h-80 overflow-auto space-y-3">
          {AVAILABLE_COURSES.map((c) => (
            <label key={c.slug} className="flex items-start gap-3 rounded-xl border p-3 hover:bg-slate-50 cursor-pointer">
              <Checkbox checked={selected.includes(c.slug)} onCheckedChange={() => toggle(c.slug)} />
              <div className="flex flex-col">
                <span className="font-medium">
                  {c.code}: {c.title}
                </span>
                <span className="text-sm text-slate-500">
                  {c.weeks} weeks · {c.lessons} lessons · {c.level}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onContinue} disabled={selected.length === 0}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
