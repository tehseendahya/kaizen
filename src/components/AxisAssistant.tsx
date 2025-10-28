"use client";
import { assistantInsights } from "@/lib/data";

export default function AxisAssistant() {
  const { progress, recommendation, streakDays, tips } = assistantInsights;
  return (
    <aside className="hidden lg:block w-[320px] shrink-0 border-l border-slate-200 bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="px-1 text-sm font-semibold text-slate-900">Axis Assistant</h2>
        </div>

        <Card>
          <div className="text-sm font-medium text-slate-900 mb-1">Great progress!</div>
          <div className="text-sm text-slate-600">You're {progress.percent}% done with {progress.courseTitle} this week.</div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-green-500" style={{ width: `${progress.percent}%` }} />
          </div>
        </Card>

        <Card className="border-violet-200 bg-violet-50">
          <div className="text-sm font-medium text-slate-900 mb-1">Recommended topic</div>
          <div className="text-sm text-slate-600 mb-2">Try reviewing {recommendation.topic} today.</div>
          <a aria-disabled title="Coming soon" className="pointer-events-none inline-flex text-violet-700 opacity-60 cursor-not-allowed">Open topic →</a>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <div className="text-sm font-medium text-slate-900 mb-1">Study streak</div>
          <div className="text-sm text-slate-600">You've studied for {streakDays} days in a row!</div>
        </Card>

        <div className="pt-2">
          <div className="px-1 text-xs font-semibold text-slate-500 mb-2">Quick Tips</div>
          {tips.map((t, i) => (
            <Card key={i}>
              <div className="text-sm text-slate-700">{t}</div>
            </Card>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}

