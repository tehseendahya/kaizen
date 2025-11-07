import { openOnboarding } from './OnboardingRoot';

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center text-4xl font-semibold text-[#0f2343]">Everything you need to succeed</h2>
      <p className="mt-3 text-center text-slate-600">The personalized, centralized platform built for Duke University students.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: '📚', title: 'Centralized Course Hub', desc: 'Access every Duke course, syllabus, and assignment from one dashboard — no more jumping between portals.' },
          { icon: '🤖', title: 'Personalized Study Plans', desc: 'Smart study plans adapt to your Duke schedule, helping you balance classes, clubs, and campus life.' },
          { icon: '🧪', title: 'Research & Campus Tools', desc: 'Discover research opportunities, professors, and campus resources — all integrated into your Axis profile.' },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border shadow-sm p-8">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 grid place-items-center text-2xl">{c.icon}</div>
            <h3 className="mt-6 text-2xl font-semibold text-[#0f2343]">{c.title}</h3>
            <p className="mt-3 text-slate-600">{c.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-slate-500">Created for Duke students. Expanding to more universities soon.</p>

      <div className="mt-10 flex justify-center">
        <button onClick={() => openOnboarding({ prefillUniversity: 'Duke University' })} className="rounded-2xl bg-blue-600 px-6 py-3 text-white shadow hover:opacity-90">
          Get started for free at Duke →
        </button>
      </div>
    </section>
  );
}
