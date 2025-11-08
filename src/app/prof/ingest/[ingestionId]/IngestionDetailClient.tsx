'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

interface DraftUnit {
  id: string;
  index: number;
  title: string;
  summary: string | null;
  draft_subunits: Array<{
    id: string;
    index: number;
    title: string;
    intuition: string;
    worked_example: string;
    pitfalls: string;
    recap: string;
    code_sketch: string | null;
    references: string | null;
  }>;
}

export default function IngestionDetailClient({
  ingestion,
  draftUnits,
  ingestionId,
}: {
  ingestion: any;
  draftUnits: DraftUnit[];
  ingestionId: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<IngestionStatus>(ingestion.status);
  const [approving, setApproving] = useState(false);

  // Poll for status updates if processing
  useEffect(() => {
    if (status === 'EXTRACTING' || status === 'AI_STRUCTURING') {
      const interval = setInterval(async () => {
        const res = await fetch(`/api/prof/ingest/status?ingestionId=${ingestionId}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (data.status === 'READY_FOR_REVIEW' || data.status === 'FAILED') {
            clearInterval(interval);
            router.refresh();
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [status, ingestionId, router]);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve and publish this ingestion?')) {
      return;
    }

    setApproving(true);
    try {
      const res = await fetch(`/api/prof/ingest/approve?ingestionId=${ingestionId}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Approval failed');
      }

      router.push('/prof');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  const course = ingestion.courses;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course?.code}: {course?.title}
            </h1>
            <p className="text-gray-600 mt-2">Ingestion Details</p>
          </div>
          <Badge className={statusColors[status] || statusColors.UPLOADED}>
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {ingestion.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {ingestion.error}
          </div>
        )}

        {status === 'READY_FOR_REVIEW' && (
          <div className="mt-4 flex gap-4">
            <Button onClick={handleApprove} disabled={approving}>
              {approving ? 'Publishing...' : 'Approve & Publish'}
            </Button>
          </div>
        )}
      </div>

      {/* Draft Units Preview */}
      <div className="space-y-6">
        {draftUnits.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            {status === 'EXTRACTING' || status === 'AI_STRUCTURING' ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Processing... This may take a few minutes.</p>
              </div>
            ) : (
              <p>No draft content available yet.</p>
            )}
          </Card>
        ) : (
          draftUnits.map((unit) => (
            <Card key={unit.id} className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                Unit {unit.index + 1}: {unit.title}
              </h2>
              {unit.summary && (
                <p className="text-gray-600 mb-4">{unit.summary}</p>
              )}

              <div className="space-y-4 mt-4">
                {unit.draft_subunits.map((subunit) => (
                  <div key={subunit.id} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="font-medium">
                      {unit.index + 1}.{subunit.index + 1} {subunit.title}
                    </h3>
                    <div className="mt-2 space-y-2 text-sm text-gray-700">
                      <div>
                        <strong>Intuition:</strong> {subunit.intuition.slice(0, 200)}...
                      </div>
                      <div>
                        <strong>Recap:</strong> {subunit.recap.slice(0, 200)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

