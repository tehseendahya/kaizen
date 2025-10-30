import { openOnboarding } from './OnboardingRoot';

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center text-4xl font-semibold text-[#0f2343]">Everything you need to succeed</h2>
      <p className="mt-3 text-center text-slate-600">Powerful tools designed to help students learn smarter, not harder.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: '📚', title: 'Smart Course Management', desc: 'Track all your courses, assignments, and deadlines in one beautiful interface designed for students.' },
          { icon: '🤖', title: 'AI Study Assistant', desc: 'Get personalized help from Gary the Penguin, your AI tutor powered by advanced learning algorithms.' },
          { icon: '📊', title: 'Progress Analytics', desc: 'Visualize your learning journey with detailed insights and performance tracking that adapts to you.' },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border shadow-sm p-8">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 grid place-items-center text-2xl">{c.icon}</div>
            <h3 className="mt-6 text-2xl font-semibold text-[#0f2343]">{c.title}</h3>
            <p className="mt-3 text-slate-600">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button onClick={() => openOnboarding()} className="rounded-2xl bg-blue-600 px-6 py-3 text-white shadow hover:opacity-90">
          Get started for free →
        </button>
      </div>
    </section>
  );
}
