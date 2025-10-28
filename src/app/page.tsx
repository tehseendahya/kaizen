"use client";
import { Button } from "@/components/ui/button";
import { todayPlan } from "@/lib/data";
import PlanItem from "@/components/PlanItem";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <WelcomeCard />
      <SmartRecommendations />
      <StudyPlan />
    </div>
  );
}

function WelcomeCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Welcome back, Sarah 👋</h2>
          <p className="text-sm text-slate-600">Here’s your progress and what’s next for today.</p>
        </div>
        <Button disabled aria-disabled="true" title="Coming soon" className="pointer-events-none opacity-60 cursor-not-allowed">View Analytics</Button>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">✓</span>
          <span>You’ve completed 3 of 5 modules this week</span>
          <span className="ml-auto text-slate-600">60%</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
          <div className="h-2 w-[60%] rounded-full bg-indigo-500" />
        </div>
      </div>
    </section>
  );
}

function SmartRecommendations() {
  const Card = ({ title, desc, cta }: { title: string; desc: string; cta: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-slate-900 font-medium">{title}</div>
      <div className="text-sm text-slate-600 mt-1">{desc}</div>
      <div className="mt-4">
        <Button disabled aria-disabled="true" title="Coming soon" className="pointer-events-none opacity-60 cursor-not-allowed">
          {cta} →
        </Button>
      </div>
    </div>
  );
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Smart Recommendations</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="AI Tutor Prompt" desc="Chat with Gary the Penguin for help in CS201." cta="Open Chat" />
        <Card title="Generate Study Set" desc="Upload notes to create flashcards or a quiz." cta="Create Material" />
        <Card title="Progress Tracker" desc="See trends across all your courses." cta="View Dashboard" />
      </div>
    </section>
  );
}

function StudyPlan() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Today’s Study Plan</h3>
        <span className="text-xs text-slate-500">Auto-generated based on your courses</span>
      </div>
      <div className="space-y-3">
        {todayPlan.map((item) => (
          <PlanItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
