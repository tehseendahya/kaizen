import Callout from "./Callout";
import Assessments from "./Assessments";

export default function SectionCard({
  section,
}: {
  section: {
    id: string; title: string; intro?: string;
    readings?: { title: string; href?: string }[];
    note?: string; example?: string;
    assessments?: { id: string; prompt: string; answer?: string }[];
  };
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm">
      <div className="text-lg font-semibold">{section.id} {section.title}</div>
      {section.intro && <p className="mt-1 text-sm text-slate-600">{section.intro}</p>}

      {(section.readings && section.readings.length > 0) && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">READINGS:</div>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {section.readings!.map((r, i) => (
              <li key={i}>{r.href ? <a className="text-blue-700 underline" href={r.href}>{r.title}</a> : r.title}</li>
            ))}
          </ul>
        </div>
      )}

      {section.note && (
        <div className="mt-3">
          <Callout variant="note" title="NOTE">{section.note}</Callout>
        </div>
      )}
      {section.example && (
        <div className="mt-3">
          <Callout variant="example" title="EXAMPLE">{section.example}</Callout>
        </div>
      )}

      <div className="mt-3">
        <Assessments items={section.assessments} />
      </div>
    </div>
  );
}
