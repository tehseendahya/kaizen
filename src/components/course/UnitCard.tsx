import SectionCard from "./SectionCard";
import TagChips from "./TagChips";

export default function UnitCard({
  unit,
}: {
  unit: {
    number: number; title: string; summary?: string;
    learningObjectives?: string[]; keyTerms?: string[];
    sections?: any[];
  };
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Unit {unit.number}: {unit.title}</h2>
      {unit.summary && <p className="mt-1 text-sm text-slate-600">{unit.summary}</p>}

      {(unit.learningObjectives?.length ?? 0) > 0 && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm font-semibold text-blue-900">Learning Objectives</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-700">
            {unit.learningObjectives!.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-900">Key Terms</div>
        <div className="mt-2"><TagChips tags={unit.keyTerms ?? []} /></div>
      </div>

      <div className="mt-5 space-y-4">
        {(unit.sections ?? []).map((s: any) => <SectionCard key={s.id} section={s} />)}
      </div>
    </section>
  );
}
