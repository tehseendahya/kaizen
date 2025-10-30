export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="rounded-3xl border shadow-sm bg-gradient-to-b from-blue-50/50 to-white p-10 grid gap-8 md:grid-cols-3 text-center">
        {[
          { value: '10,000+', label: 'Active Students' },
          { value: '500+', label: 'Courses Available' },
          { value: '95%', label: 'Satisfaction Rate' },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-5xl font-semibold text-blue-600">{s.value}</div>
            <div className="mt-2 text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

