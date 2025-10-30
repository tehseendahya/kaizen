import Link from 'next/link';
import { openOnboarding } from './OnboardingRoot';

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center">
      <h2 className="text-5xl md:text-6xl font-semibold text-[#0f2343]">Bringing Duke academics together, finally.</h2>
      <p className="mx-auto mt-4 max-w-3xl text-slate-600">
        Axis unites your courses, research, and campus tools into one personalized platform for Duke students.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button onClick={() => openOnboarding({ prefillUniversity: 'Duke University' })} className="rounded-2xl bg-blue-600 px-6 py-3 text-white shadow hover:opacity-90">
          Join the Duke beta →
        </button>
        <Link href="/demo" className="rounded-2xl border px-6 py-3 shadow-sm hover:bg-slate-50">See how it works</Link>
      </div>
    </section>
  );
}
