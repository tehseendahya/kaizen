'use client';
import Link from 'next/link';
import { openOnboarding } from './OnboardingRoot';

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm bg-blue-50/60 text-blue-700 text-sm">
        <span className="h-2 w-2 rounded-full bg-blue-600" />
        <span>New: Built for Duke University Students</span>
      </div>

      <h1 className="mt-8 text-6xl md:text-7xl font-semibold tracking-tight text-[#0f2343]">
        Your personalized Duke learning platform
      </h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
        Axis helps Duke students organize courses, assignments, deadlines, and research — all in one centralized, AI-powered space designed for how you learn.
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button onClick={() => openOnboarding({ prefillUniversity: 'Duke University' })} className="rounded-2xl bg-blue-600 px-6 py-3 text-white shadow hover:opacity-90">
          Get started for free at Duke →
        </button>
        <Link href="/demo" className="rounded-2xl border px-6 py-3 shadow-sm hover:bg-slate-50 inline-flex items-center gap-2">
          <span>▶</span> <span>View demo</span>
        </Link>
      </div>
    </section>
  );
}
