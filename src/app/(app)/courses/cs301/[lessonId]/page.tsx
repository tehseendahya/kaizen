// placeholder to avoid route errors; directs back to course page
import Link from 'next/link';
export default function Page(){
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Link href="/courses/cs301" className="px-4 py-2 rounded bg-blue-600 text-white">Back to CS301</Link>
    </div>
  );
}
