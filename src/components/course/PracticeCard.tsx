type PracticeCardProps = {
  items: string[];
};

export default function PracticeCard({ items }: PracticeCardProps) {
  const defaultItems = [
    "Paraphrase the core idea of this lesson in your own words.",
    "Create a small example that demonstrates the concept.",
    "Explain one common misconception and why it's incorrect.",
  ];

  const practiceItems = items && items.length > 0 ? items : defaultItems;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Practice</h2>
      <ol className="space-y-3 list-decimal list-inside text-slate-700">
        {practiceItems.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

