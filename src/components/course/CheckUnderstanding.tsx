"use client";

import { useState } from "react";
import type { Assessment } from "@/lib/courses/unified-loader";

type CheckUnderstandingProps = {
  items: Assessment[];
};

export default function CheckUnderstanding({ items }: CheckUnderstandingProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Check Your Understanding</h2>
        <p className="text-sm text-slate-500">No questions available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Check Your Understanding</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border-b last:border-b-0 pb-4 last:pb-0">
            <div className="font-medium text-sm mb-2 text-slate-900">
              {item.prompt}
            </div>
            {item.answer && (
              <button
                onClick={() => toggleReveal(item.id)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2"
              >
                {revealed.has(item.id) ? "Hide answer" : "Reveal answer"}
              </button>
            )}
            {revealed.has(item.id) && item.answer && (
              <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

