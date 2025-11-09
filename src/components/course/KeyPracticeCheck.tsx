export function KeyConceptsCard({ overview, bullets }: { overview?: string; bullets?: string[] }) {
  return (
    <div className="rounded-2xl border bg-blue-50 p-5 shadow-sm">
      <div className="text-lg font-semibold">Key Concepts</div>
      {overview && <p className="mt-2 text-slate-800">{overview}</p>}
      {(bullets?.length ?? 0) > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {bullets!.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

export function PracticeCard({ items }: { items: string[] }) {
  const list = items?.length ? items : [
    "Paraphrase the core idea in your own words.",
    "Create a small example that demonstrates the concept.",
    "Explain one misconception and why it's incorrect."
  ];
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-lg font-semibold">Practice</div>
      <div className="mt-1 text-sm text-slate-600">Think about it</div>
      <ol className="mt-2 list-decimal space-y-2 pl-5">{list.map((x,i)=><li key={i}>{x}</li>)}</ol>
    </div>
  );
}

