// Re-export the existing lesson page from original path if needed.
import Link from 'next/link';

export default function CS201LessonFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Lesson route not available</h1>
        <p className="text-gray-600 mb-6">Please use the course page to navigate content.</p>
        <Link href="/courses/cs201" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">← Back to CS201</Link>
      </div>
    </div>
  );
}
