"use client";
import { useRouter } from "next/navigation";
import type { PlanItem as PlanItemType } from "@/lib/data";

export default function PlanItem({ item }: { item: PlanItemType }) {
  const router = useRouter();

  const onClick = () => {
    if (item.type === 'quiz') {
      router.push(`/courses/${item.courseSlug}/quizzes/${item.id}`);
    } else if (item.type === 'module') {
      router.push(`/courses/${item.courseSlug}/modules/${item.id}`);
    } else {
      router.push(`/research/${item.id}`);
    }
  };

  const badge = badgeContent(item);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
        <div className="flex-1 truncate">
          <div className="truncate font-medium text-slate-900">{item.title}</div>
          <div className="text-xs text-slate-500">
            {item.type === 'quiz' && `Due ${new Date(item.dueISO).toLocaleDateString()}`}
            {item.type === 'module' && `~${item.estMins} mins`}
            {item.type === 'research' && `Deadline ${new Date(item.deadlineISO).toLocaleDateString()}`}
          </div>
        </div>
        <span className="text-slate-400">→</span>
      </div>
    </button>
  );
}

function badgeContent(item: PlanItemType): { label: string; className: string } {
  switch (item.type) {
    case 'quiz':
      return { label: 'Quiz', className: 'bg-violet-100 text-violet-700' };
    case 'module':
      return { label: 'Module', className: 'bg-blue-100 text-blue-700' };
    case 'research':
      return { label: 'Research', className: 'bg-emerald-100 text-emerald-700' };
  }
}

