"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getRole, setRole, getSelectedCourses, setSelectedCourses } from "@/lib/user/prefs";
import { getCoursesRepo } from "@/lib/courses/repo";
import type { Course } from "@/lib/courses/types";

type Props = { open: boolean; onClose: () => void };

export default function WelcomeModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<"student" | "professor">("student");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!open) return;
    const r = getRole();
    if (r) setTab(r);
    setSelected(getSelectedCourses());
    getCoursesRepo().listAll().then(setAllCourses);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCourses;
    return allCourses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [query, allCourses]);

  const toggle = (slug: string) => {
    // Allow selecting any number of courses (no max)
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const saveStudent = () => {
    setRole("student");
    setSelectedCourses(selected);
    onClose();
  };

  const saveProfessor = () => {
    setRole("professor");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">Welcome to Axis</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Button variant={tab === "student" ? "default" : "outline"} onClick={() => setTab("student")}>
            Student
          </Button>
          <Button variant={tab === "professor" ? "default" : "outline"} onClick={() => setTab("professor")}>
            Professor
          </Button>
        </div>

        {tab === "student" ? (
          <div className="space-y-3 mt-4">
            <label className="text-sm text-slate-600">Search and select your course(s)</label>
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-500"
              placeholder="Course code or title (e.g., CS201, PHYS 152)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="max-h-64 overflow-auto rounded border border-slate-200 bg-white">
              {filtered.map((c) => {
                const isSelected = selected.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    onClick={() => toggle(c.slug)}
                    className={`w-full text-left p-3 transition hover:bg-slate-100 ${
                      isSelected ? "bg-slate-100" : ""
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {c.code} — {c.title}
                        </div>
                        <div className="text-sm text-slate-600">{c.instructor}</div>
                      </div>
                      {isSelected && <Badge className="bg-slate-200 text-slate-900">Selected</Badge>}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-3 text-sm text-slate-600">No matches. Try “CS201” or “PHYS 152”.</div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-600">Selected: {selected.join(", ") || "none"}</div>
              <Button onClick={saveStudent} disabled={selected.length === 0}>
                Save & Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Professor tools are coming soon. You can browse courses or request early access.
            </p>
            <div className="flex gap-2">
              <a href="mailto:hello@axis.example?subject=Axis%20Professor%20Early%20Access">
                <Button>Request Early Access</Button>
              </a>
              <Button variant="outline" onClick={saveProfessor}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
