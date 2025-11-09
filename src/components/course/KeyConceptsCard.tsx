import { CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type KeyConceptsCardProps = {
  overview: string;
  bullets: string[];
};

export default function KeyConceptsCard({
  overview,
  bullets,
}: KeyConceptsCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-blue-600" />
        Key Concepts
      </h2>
      {overview && (
        <div className="prose prose-sm max-w-none mb-4 text-slate-700">
          <ReactMarkdown>{overview}</ReactMarkdown>
        </div>
      )}
      {bullets && bullets.length > 0 && (
        <ul className="space-y-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-600 mt-1">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

