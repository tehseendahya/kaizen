'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import RenderCourse from '@/app/courses/components/RenderCourse';
import { CourseContentV1 } from '@/lib/course-schema';

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

export default function IngestionDetailClient({
  ingestion,
  draftContent,
  ingestionId,
}: {
  ingestion: any;
  draftContent: CourseContentV1 | null;
  ingestionId: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<IngestionStatus>(ingestion.status);
  const [approving, setApproving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Note: Status polling removed - refresh page to see updates

  const handleParseFiles = async () => {
    setParsing(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/prof/ingest/${ingestionId}/parse`, {
        method: 'POST',
      });

      if (!res.ok) {
        // Use the same error extraction pattern
        let errorData: any = {};
        let responseText = '';
        try {
          responseText = await res.text();
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { error: responseText, raw: responseText };
            }
          } else {
            errorData = { error: 'Empty response', status: res.status };
          }
        } catch (readError: any) {
          errorData = {
            error: 'Failed to read error response',
            readError: readError?.message || 'Unknown error',
            status: res.status,
            statusText: res.statusText,
          };
        }
        
        const errorMessage = errorData.details || errorData.error || 'Parse failed';
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      // Show detailed message
      const message = data.message || `Successfully parsed ${data.parsedCount} file(s)`;
      
      // Build error message with file-specific errors
      let errorMsg = '';
      if (data.errors && data.errors.length > 0) {
        errorMsg = '\n\nFile Errors:\n' + data.errors.map((e: any) => `• ${e.file}: ${e.error}`).join('\n');
      }
      
      if (data.parsedCount === 0) {
        // No files were parsed - keep status as UPLOADED so button remains visible
        // Don't change status, allow user to retry
        const warningMsg = data.warning 
          ? `${message}\n\n${data.warning}\n\nTotal files: ${data.totalFiles || 0}\nAlready parsed: ${data.alreadyParsed || 0}\nUnparsed: ${data.unparsedFiles || 0}${errorMsg}`
          : `${message}\n\nTotal files: ${data.totalFiles || 0}\nAlready parsed: ${data.alreadyParsed || 0}\nUnparsed: ${data.unparsedFiles || 0}${errorMsg}`;
        setError(message + (data.warning ? `\n\n${data.warning}` : '') + errorMsg);
        alert(warningMsg);
        // Don't refresh - let user see the error and try again
      } else {
        // Files were parsed successfully - update status and refresh
        setStatus('EXTRACTING');
        if (data.errors && data.errors.length > 0) {
          // Some files had errors, show warning but continue
          setError(`Parsed ${data.parsedCount} files successfully, but ${data.errors.length} file(s) had errors.${errorMsg}`);
        } else {
          setError(null);
        }
        alert(message + (data.errors && data.errors.length > 0 ? errorMsg : ''));
        router.refresh();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Parse failed';
      setError(errorMessage);
      console.error('[handleParseFiles]', error);
    } finally {
      setParsing(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!ingestion.course_id) {
      setError('No course ID available');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/prof/courses/${ingestion.course_id}/generate-draft`, {
        method: 'POST',
      });

      if (!res.ok) {
        // Use the same error extraction pattern
        let errorData: any = {};
        let responseText = '';
        try {
          responseText = await res.text();
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { error: responseText, raw: responseText };
            }
          } else {
            errorData = { error: 'Empty response', status: res.status };
          }
        } catch (readError: any) {
          errorData = {
            error: 'Failed to read error response',
            readError: readError?.message || 'Unknown error',
            status: res.status,
            statusText: res.statusText,
          };
        }
        
        const errorMessage = errorData.details || errorData.error || 'Generation failed';
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setStatus('READY_FOR_REVIEW');
      setError(null);
      alert('Draft generated successfully!');
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setError(errorMessage);
      console.error('[handleGenerateDraft]', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this course?')) {
      return;
    }

    if (!ingestion.course_id) {
      setError('No course ID available');
      return;
    }

    setApproving(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/prof/courses/${ingestion.course_id}/publish`, {
        method: 'POST',
      });

      if (!res.ok) {
        // Use the same error extraction pattern
        let errorData: any = {};
        let responseText = '';
        try {
          responseText = await res.text();
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { error: responseText, raw: responseText };
            }
          } else {
            errorData = { error: 'Empty response', status: res.status };
          }
        } catch (readError: any) {
          errorData = {
            error: 'Failed to read error response',
            readError: readError?.message || 'Unknown error',
            status: res.status,
            statusText: res.statusText,
          };
        }
        
        const errorMessage = errorData.details || errorData.error || 'Publish failed';
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setStatus('PUBLISHED');
      alert(`Course published successfully! ${data.message || ''}`);
      router.push('/prof');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Publish failed';
      setError(errorMessage);
      console.error('[handlePublish]', error);
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

        {(ingestion.error || error) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <strong className="text-red-800">Error:</strong>
              <div className="text-red-700 whitespace-pre-wrap flex-1 overflow-auto max-h-64">
                {error || ingestion.error}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          {/* Step 1: Parse Files - Show if UPLOADED (will stay UPLOADED if parsing fails) */}
          {status === 'UPLOADED' && (
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleParseFiles} 
                disabled={parsing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {parsing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Parsing Files...
                  </>
                ) : (
                  <>
                    📄 Parse Files
                  </>
                )}
              </Button>
              <span className="text-sm text-gray-600">
                Step 1: Extract text from uploaded files
                {error && <span className="text-red-600 ml-2">(Click to retry)</span>}
              </span>
            </div>
          )}

          {/* Step 2: Generate Draft */}
          {(status === 'EXTRACTING' || status === 'UPLOADED') && (
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleGenerateDraft} 
                disabled={generating || status !== 'EXTRACTING'}
                className={status === 'EXTRACTING' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {generating ? (
                  <>
                    <span className="animate-spin mr-2">🤖</span>
                    Generating Draft...
                  </>
                ) : (
                  <>
                    ✨ Generate AI Draft
                  </>
                )}
              </Button>
              <span className="text-sm text-gray-600">
                Step 2: Use AI to create structured course content
              </span>
            </div>
          )}

          {/* Step 3: Preview and Publish */}
          {status === 'READY_FOR_REVIEW' && (
            <div className="flex items-center gap-4">
              <Link 
                href={`/courses/${ingestion.course_id}?preview=1`}
                target="_blank"
              >
                <Button variant="outline">
                  👁️ Preview as Student
                </Button>
              </Link>
              <Button 
                onClick={handlePublish} 
                disabled={approving}
                className="bg-green-600 hover:bg-green-700"
              >
                {approving ? (
                  <>
                    <span className="animate-spin mr-2">📚</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    🚀 Publish Course
                  </>
                )}
              </Button>
              <span className="text-sm text-gray-600">
                Step 3: Review draft and publish for students
              </span>
            </div>
          )}

          {/* Already Published */}
          {status === 'PUBLISHED' && (
            <div className="flex items-center gap-4">
              <Link 
                href={`/courses/${ingestion.course_id}`}
                target="_blank"
              >
                <Button className="bg-green-600 hover:bg-green-700">
                  📖 View Published Course
                </Button>
              </Link>
              <span className="text-sm text-green-600 font-semibold">
                ✅ Course is live for students!
              </span>
            </div>
          )}
        </div>
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

