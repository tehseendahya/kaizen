export default function PitfallsList({ content }: { content: string }) {
  if (!content || !content.trim()) return null;

  // Parse content - could be numbered list, bullet points, or plain text
  const items = content
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove common prefixes like "(i)", "(ii)", "•", "-", etc.
      return line.replace(/^\([ivx]+\)\s*/i, '').replace(/^[•\-]\s*/, '').trim();
    })
    .filter(item => item.length > 0);

  if (items.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-900">
        COMMON PITFALLS
      </div>
      <ul className="mt-2 space-y-2 list-disc list-inside text-sm text-slate-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

