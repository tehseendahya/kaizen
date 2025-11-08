import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/prof');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <div className="mb-8">
            <Link href="/prof" className="text-2xl font-bold text-blue-600">
              Axis
            </Link>
            <p className="text-sm text-gray-500 mt-1">Professor Portal</p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/prof"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/prof/ingest/new"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              New Ingestion
            </Link>
            <Link
              href="/prof/courses"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              My Courses
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

