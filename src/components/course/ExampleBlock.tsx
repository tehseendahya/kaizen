export default function ExampleBlock({ content }: { content: string }) {
  if (!content || !content.trim()) return null;

  return (
    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-900">
        WORKED EXAMPLE
      </div>
      <div className="text-sm text-slate-700 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

