import Link from 'next/link';

export default function LegacyLessonFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Lesson view is in-page</h1>
        <p className="text-gray-600 mb-6">Select lessons from the sidebar on the Physics 152 course page.</p>
        <Link href="/courses/physics-152" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">← Back to Physics 152</Link>
      </div>
    </div>
  );
}
