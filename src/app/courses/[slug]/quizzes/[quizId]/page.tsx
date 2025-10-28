import Link from "next/link";

export default function QuizStub({ params }: { params: { slug: string; quizId: string } }) {
  const { slug, quizId } = params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Quiz: {quizId}</h1>
      <p className="text-slate-600">Course: {slug}</p>
      <p className="text-slate-600">This is a stub route for quiz navigation.</p>
      <Link href="/" className="text-indigo-600 underline">← Back to dashboard</Link>
    </div>
  );
}

