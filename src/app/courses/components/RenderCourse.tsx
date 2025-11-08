/**
 * RenderCourse Component
 * Renders structured course content for both student view and professor preview
 */

'use client';

import { CourseContentV1 } from '@/lib/course-schema';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RenderCourse({ data }: { data: CourseContentV1 }) {
  // Debug logging
  console.log('[RenderCourse] Rendering course:', {
    hasData: !!data,
    hasCourseMeta: !!data?.courseMeta,
    unitsCount: data?.units?.length || 0,
    dataKeys: data ? Object.keys(data) : []
  });

  if (!data || !data.courseMeta) {
    console.error('[RenderCourse] Missing course data or courseMeta:', {
      hasData: !!data,
      hasCourseMeta: !!data?.courseMeta
    });
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-semibold mb-2">No course content available</p>
        <p className="text-sm">The course draft may be empty or invalid.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Course Header */}
      <header className="space-y-4 pb-6 border-b">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            {data.courseMeta.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant="outline">{data.courseMeta.code}</Badge>
            {data.courseMeta.term && (
              <span>{data.courseMeta.term}</span>
            )}
          </div>
        </div>
        
        {data.courseMeta.description && (
          <p className="text-gray-700 leading-relaxed">
            {data.courseMeta.description}
          </p>
        )}
        
        {data.courseMeta.prerequisites && data.courseMeta.prerequisites.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-900">Prerequisites</h3>
            <div className="flex flex-wrap gap-2">
              {data.courseMeta.prerequisites.map((prereq, idx) => (
                <Badge key={idx} variant="secondary">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Units */}
      {data.units.map((unit, unitIdx) => (
        <section key={unitIdx} className="space-y-6">
          {/* Unit Header */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                {unitIdx + 1}
              </span>
              {unit.title}
            </h2>
            
            {unit.overview && (
              <p className="text-gray-700 leading-relaxed ml-13">
                {unit.overview}
              </p>
            )}
          </div>

          {/* Learning Objectives */}
          {unit.learningObjectives && unit.learningObjectives.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">
                Learning Objectives
              </h3>
              <ul className="space-y-1">
                {unit.learningObjectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Key Terms */}
          {unit.keyTerms && unit.keyTerms.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-900">Key Terms</h3>
              <div className="flex flex-wrap gap-2">
                {unit.keyTerms.map((term, idx) => (
                  <Badge key={idx} variant="outline">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          <div className="space-y-6 ml-6">
            {unit.lessons.map((lesson, lessonIdx) => (
              <Card key={lessonIdx} className="overflow-hidden">
                {/* Lesson Header */}
                <div className="p-6 space-y-3 border-b bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {unitIdx + 1}.{lessonIdx + 1} {lesson.title}
                  </h3>
                  {lesson.summary && (
                    <p className="text-gray-700">{lesson.summary}</p>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Readings */}
                  {lesson.readings && lesson.readings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-900">
                        Readings
                      </h4>
                      <ul className="space-y-1">
                        {lesson.readings.map((reading, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-gray-400 mt-0.5">📖</span>
                            <span>{reading}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content Blocks */}
                  {lesson.contentBlocks && lesson.contentBlocks.length > 0 && (
                    <div className="space-y-4">
                      {lesson.contentBlocks.map((block, blockIdx) => (
                        <div
                          key={blockIdx}
                          className={`rounded-lg p-4 ${getBlockStyle(block.type)}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getBlockIcon(block.type)}</span>
                            <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                              {block.type}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                            {block.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assessments */}
                  {lesson.assessments && lesson.assessments.length > 0 && (
                    <details className="group">
                      <summary className="cursor-pointer font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors">
                        Assessments ({lesson.assessments.length})
                      </summary>
                      <div className="mt-4 space-y-3">
                        {lesson.assessments.map((assessment, idx) => (
                          <Card key={idx} className="p-4 bg-gray-50">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {assessment.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-800">
                                {assessment.prompt}
                              </p>
                              {assessment.answerKey && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                                    Show Answer
                                  </summary>
                                  <p className="mt-2 text-sm text-gray-700 bg-white rounded p-2">
                                    {assessment.answerKey}
                                  </p>
                                </details>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Empty state for no units */}
      {(!data.units || data.units.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p>No course units available yet.</p>
        </div>
      )}
    </div>
  );
}

// Helper function to get block styling based on type
function getBlockStyle(type: string): string {
  switch (type) {
    case 'note':
      return 'bg-blue-50 border border-blue-200';
    case 'example':
      return 'bg-green-50 border border-green-200';
    case 'derivation':
      return 'bg-purple-50 border border-purple-200';
    case 'exercise':
      return 'bg-orange-50 border border-orange-200';
    case 'faq':
      return 'bg-yellow-50 border border-yellow-200';
    default:
      return 'bg-gray-50 border border-gray-200';
  }
}

// Helper function to get block icon based on type
function getBlockIcon(type: string): string {
  switch (type) {
    case 'note':
      return '📝';
    case 'example':
      return '💡';
    case 'derivation':
      return '🔍';
    case 'exercise':
      return '✏️';
    case 'faq':
      return '❓';
    default:
      return '📄';
  }
}
