"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SidebarNav({
  course, activeSlug,
}: {
  course: any; activeSlug?: string;
}) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  const toggleUnit = (unitNumber: number) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitNumber)) {
        next.delete(unitNumber);
      } else {
        next.add(unitNumber);
      }
      return next;
    });
  };

  return (
    <nav className="rounded-2xl border bg-white p-3">
      <div className="px-2 pb-2 text-sm font-semibold text-slate-700">Course Content</div>
      <div className="space-y-2">
        {(course.units ?? []).sort((a: any, b: any) => a.number - b.number).map((u: any) => {
          const isExpanded = expandedUnits.has(u.number);
          return (
            <div key={u.number}>
              <button
                onClick={() => toggleUnit(u.number)}
                className="flex w-full items-center justify-between px-2 py-1 text-sm font-medium hover:bg-slate-50 rounded"
              >
                <span>{u.title}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isExpanded && (
                <div className="ml-2 flex flex-col">
                  {(u.sections ?? []).map((s: any) => {
                    const href = `/courses/${course.id}/${s.slug}`;
                    const active = activeSlug === s.slug;
                    return (
                      <Link
                        key={s.slug}
                        href={href}
                        className={`rounded-md px-2 py-1 text-sm ${active ? "bg-blue-600 text-white" : "hover:bg-slate-100"}`}
                      >
                        {s.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
