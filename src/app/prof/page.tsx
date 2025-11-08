import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type IngestionStatus = 'UPLOADED' | 'EXTRACTING' | 'AI_STRUCTURING' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'FAILED';

const statusColors: Record<IngestionStatus, string> = {
  UPLOADED: 'bg-gray-100 text-gray-800',
  EXTRACTING: 'bg-blue-100 text-blue-800',
  AI_STRUCTURING: 'bg-purple-100 text-purple-800',
  READY_FOR_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  PUBLISHED: 'bg-green-200 text-green-900',
  FAILED: 'bg-red-100 text-red-800',
};

export default async function ProfDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch ingestions for this professor
  const { data: ingestions, error } = await supabase
    .from('ingestions')
    .select(`
      id,
      status,
      created_at,
      updated_at,
      error,
      courses (
        id,
        code,
        title
      )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching ingestions:', {
      message: error.message || 'Unknown error',
      code: error.code || '',
      details: error.details || '',
      hint: error.hint || '',
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your course ingestions</p>
        </div>
        <Link href="/prof/ingest/new">
          <Button>New Ingestion</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Ingestions</h2>
        </div>

        {!ingestions || ingestions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No ingestions yet</p>
            <Link href="/prof/ingest/new">
              <Button>Create Your First Ingestion</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingestions.map((ingestion: any) => {
                  const course = ingestion.courses;
                  const status = ingestion.status as IngestionStatus;
                  const createdAt = new Date(ingestion.created_at).toLocaleDateString();

                  return (
                    <tr key={ingestion.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {course?.code || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course?.title || 'No title'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[status] || statusColors.UPLOADED}>
                          {status.replace(/_/g, ' ')}
                        </Badge>
                        {ingestion.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {ingestion.error.slice(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/prof/ingest/${ingestion.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

