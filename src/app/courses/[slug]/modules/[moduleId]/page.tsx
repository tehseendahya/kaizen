export default function ModuleStub({ params }: { params: { slug: string; moduleId: string } }) {
  const { slug, moduleId } = params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Module: {moduleId}</h1>
      <p className="text-slate-600">Course: {slug}</p>
      <p className="text-slate-600">This is a stub route for module navigation.</p>
    </div>
  );
}
