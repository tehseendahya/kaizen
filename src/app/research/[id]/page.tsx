import Link from "next/link";

export default function ResearchStub({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Research Task: {params.id}</h1>
      <p className="text-slate-600">This is a stub route for research items.</p>
      <Link href="/" className="text-indigo-600 underline">← Back to dashboard</Link>
    </div>
  );
}

