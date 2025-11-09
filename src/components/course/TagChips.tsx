export default function TagChips({ tags }: { tags: string[] | undefined }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t, i) => (
        <span
          key={i}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
