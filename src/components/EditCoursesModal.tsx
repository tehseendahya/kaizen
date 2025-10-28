"use client";
import { useEffect, useMemo, useState } from "react";
import { allCourses } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onSave: (slugs: string[]) => void;
};

export default function EditCoursesModal({ open, onOpenChange, selected, onSave }: Props) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => setDraft(selected), [selected, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCourses;
    return allCourses.filter(c => `${c.code} ${c.title}`.toLowerCase().includes(q));
  }, [query]);

  const toggle = (slug: string) => {
    setDraft((curr) => curr.includes(slug) ? curr.filter(s => s !== slug) : [...curr, slug]);
  };

  const moveUp = (slug: string) => {
    setDraft((curr) => {
      const i = curr.indexOf(slug); if (i <= 0) return curr; const copy = curr.slice();
      [copy[i-1], copy[i]] = [copy[i], copy[i-1]]; return copy;
    });
  };
  const moveDown = (slug: string) => {
    setDraft((curr) => {
      const i = curr.indexOf(slug); if (i === -1 || i >= curr.length-1) return curr; const copy = curr.slice();
      [copy[i+1], copy[i]] = [copy[i], copy[i+1]]; return copy;
    });
  };

  const handleSave = () => { onSave(draft); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Courses</DialogTitle>
          <p className="text-sm text-slate-600">Add, remove, or reorder the courses shown in your sidebar.</p>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Search course code or title…" value={query} onChange={(e)=>setQuery(e.target.value)} />

          <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
            {filtered.map((c) => {
              const checked = draft.includes(c.slug);
              return (
                <label key={c.slug} className="flex items-center gap-3 px-3 py-2 text-sm border-b last:border-b-0">
                  <input type="checkbox" className="h-4 w-4" checked={checked} onChange={() => toggle(c.slug)} />
                  <span className={`inline-block h-2 w-2 rounded-full ${c.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{c.code} <span className="text-slate-600 font-normal">— {c.title}</span></div>
                    <div className="text-xs text-slate-500">{c.instructor}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => moveUp(c.slug)} aria-label={`Move ${c.code} up`}>↑</Button>
                    <Button variant="outline" size="sm" onClick={() => moveDown(c.slug)} aria-label={`Move ${c.code} down`}>↓</Button>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
