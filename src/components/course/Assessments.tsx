"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

export default function Assessments({
  items,
  label = "Assessments",
}: {
  items: { id: string; prompt: string; answer?: string }[] | undefined;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const count = items?.length ?? 0;
  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm"
      >
        <span className="font-medium">{label} ({count})</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && count > 0 && (
        <div className="space-y-3 border-t p-3">
          {items!.map((q) => (
            <details key={q.id} className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">{q.prompt}</summary>
              {q.answer && <div className="prose prose-sm mt-2 text-slate-700">{q.answer}</div>}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
