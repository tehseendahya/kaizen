"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { COURSE_CATALOG } from '@/data/courses';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type SelectedCourse = { code?: string; title: string };

export function OnboardingDialog({ open, onOpenChange, prefillSchool }: { open: boolean; onOpenChange: (v: boolean) => void; prefillSchool?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<SelectedCourse[]>([]);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [touched, setTouched] = React.useState<{ email?: boolean; school?: boolean; courses?: boolean }>({});
  // Dropdown visibility + element refs
  const [isListOpen, setIsListOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // Prefill if values exist; allow external prefill to override school
  React.useEffect(() => {
    if (!open) return;
    try {
      const e = localStorage.getItem('axis.email') || '';
      const storedSchool = localStorage.getItem('axis.school') || '';
      const c = localStorage.getItem('axis.courses');
      setEmail(e);
      setSchool(prefillSchool ?? storedSchool);
      setSelected(c ? (JSON.parse(c) as SelectedCourse[]) : []);
    } catch {}
  }, [open, prefillSchool]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canContinue = emailValid && school.trim().length > 1 && selected.length > 0;

  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSE_CATALOG.slice(0, 8);
    const tokens = q.split(/\s+/);
    return COURSE_CATALOG.filter((c) => {
      const hay = `${c.code} ${c.title}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    }).slice(0, 8);
  }, [query]);

  function addCourse(item: SelectedCourse) {
    if (selected.some((s) => (s.code && s.code === item.code) || s.title === item.title)) return;
    setSelected((prev) => [...prev, item]);
    setQuery('');
    setActiveIdx(0);
  }

  function removeCourse(idx: number) {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  }

  function onEnter() {
    if (suggestions[activeIdx]) {
      const s = suggestions[activeIdx];
      addCourse({ code: s.code, title: `${s.code} · ${s.title}` });
    } else if (query.trim()) {
      addCourse({ title: query.trim() });
    }
    setIsListOpen(false);
  }

  function onSubmit() {
    setTouched({ email: true, school: true, courses: true });
    if (!canContinue) return;
    setIsListOpen(false);
    try {
      localStorage.setItem('axis.email', email.trim());
      localStorage.setItem('axis.school', school.trim());
      localStorage.setItem('axis.courses', JSON.stringify(selected));
      const slugs = selected
        .map((s) => s.code?.toLowerCase())
        .filter(Boolean) as string[];
      localStorage.setItem('enrolledCourseSlugs', JSON.stringify(slugs));
    } catch {}
    onOpenChange(false);
    router.push('/courses');
  }

  // keyboard handlers for suggestions list
  function onCoursesKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setIsListOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && query.length === 0 && selected.length > 0) {
      removeCourse(selected.length - 1);
    }
  }

  // Toggle on click; focus opens for keyboard users
  function onCoursesClick() {
    setIsListOpen((v) => !v);
  }
  function onCoursesFocus() {
    setIsListOpen(true);
  }

  // Close on outside click but ignore clicks inside input/list
  React.useEffect(() => {
    function onDocMouseDown(ev: MouseEvent) {
      const t = ev.target as Node;
      if (!dialogRef.current) return;
      const insideDialog = dialogRef.current.contains(t);
      if (!insideDialog) return;
      const insideList = listRef.current?.contains(t);
      const insideInput = inputRef.current?.contains(t as Node);
      if (!insideList && !insideInput) setIsListOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={dialogRef} className="sm:max-w-xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <span className="absolute h-1.5 w-1.5 rounded-full bg-blue-600 left-0 bottom-0" />
              <span className="inline-flex h-5 w-5 rounded-full border-[2px] border-[#0B1E3F]" />
            </span>
            Get started with Axis
          </DialogTitle>
          <p className="text-sm text-slate-600">Enter your info to personalize your learning experience.</p>
        </DialogHeader>

        {/* Email */}
        <div className="mt-3">
          <label htmlFor="axis-email" className="block text-sm font-medium text-slate-700">Email address</label>
          <input
            id="axis-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={`mt-1 w-full h-12 rounded-xl border px-3 shadow-sm outline-none focus:ring-2 ${
              !emailValid && touched.email ? 'border-red-300 ring-red-400/70' : 'border-slate-300 ring-blue-500/70'
            }`}
            placeholder="you@university.edu"
          />
          {!emailValid && touched.email && (
            <p className="mt-1 text-xs text-red-600">Enter a valid university email.</p>
          )}
        </div>

        {/* School */}
        <div className="mt-4">
          <label htmlFor="axis-school" className="block text-sm font-medium text-slate-700">University or School</label>
          <input
            id="axis-school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, school: true }))}
            className={`mt-1 w-full h-12 rounded-xl border px-3 shadow-sm outline-none focus:ring-2 ${
              school.trim().length <= 1 && touched.school ? 'border-red-300 ring-red-400/70' : 'border-slate-300 ring-blue-500/70'
            }`}
            placeholder="Duke University"
          />
          {school.trim().length <= 1 && touched.school && (
            <p className="mt-1 text-xs text-red-600">School is required.</p>
          )}
        </div>

        {/* Courses typeahead */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Select your courses</label>
          <p className="text-xs text-slate-500">Choose the courses you’re currently enrolled in.</p>
          {/* chips */}
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((s, i) => (
                <span key={`${s.title}-${i}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">
                  {s.title}
                  <button aria-label="Remove" className="text-slate-500 hover:text-slate-900" onClick={() => removeCourse(i)}>×</button>
                </span>
              ))}
            </div>
          )}

          <div className="relative mt-2">
            <input
              aria-label="Courses"
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
              onKeyDown={onCoursesKeyDown}
              onClick={onCoursesClick}
              onFocus={onCoursesFocus}
              onBlur={() => setTimeout(() => setIsListOpen(false), 120)}
              className="w-full h-12 rounded-xl border border-slate-300 px-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/70"
              placeholder="Type course code or title (e.g., CS201, Linear Algebra)"
            />
            {/* Suggestion list */}
            {isListOpen && (
              <div ref={listRef} role="listbox" className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-72 overflow-auto">
                {suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">No matches. Press Enter to add “{query.trim()}”.</div>
                ) : suggestions.map((s, i) => (
                  <div
                    key={s.code + i}
                    role="option"
                    aria-selected={i === activeIdx}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 ${i === activeIdx ? 'bg-slate-50' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); const c = suggestions[i]; if (c) { addCourse({ code: c.code, title: `${c.code} · ${c.title}` }); setIsListOpen(false); inputRef.current?.focus(); } }}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <div className="font-medium">{s.code} · {s.title}</div>
                    {(s.level || s.weeks) && (
                      <div className="text-xs text-slate-500">{s.level ? `${s.level}` : ''}{s.level && s.weeks ? ' · ' : ''}{s.weeks ? `${s.weeks} weeks` : ''}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selected.length === 0 && touched.courses && (
            <p className="mt-1 text-xs text-red-600">Add at least one course.</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={!canContinue} className={!canContinue ? 'opacity-60 cursor-not-allowed' : ''}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
