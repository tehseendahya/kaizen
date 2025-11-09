'use client';

import React, { useState } from 'react';
import { ExternalLink, BookOpen, CheckCircle } from 'lucide-react';

type ResearchSource = {
  url: string;
  title: string;
  snippet: string;
  domain: string;
};

type ResearchSourcesBadgeProps = {
  sources: ResearchSource[];
  citationsUsed: number[];
  researchSummary?: {
    totalLessons?: number;
    totalSources?: number;
    lessonsWithSources?: number;
    topDomains?: Array<{ domain: string; count: number }>;
  };
};

export function ResearchSourcesBadge({ sources, citationsUsed, researchSummary }: ResearchSourcesBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
        <BookOpen className="w-4 h-4" />
        <span>No research sources</span>
      </div>
    );
  }

  const academicCount = sources.filter(s => 
    s.domain.includes('.edu') || s.domain.includes('.gov')
  ).length;

  const hasDeepResearch = researchSummary && researchSummary.totalLessons && researchSummary.totalLessons > 0;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors"
      >
        <CheckCircle className="w-4 h-4" />
        <span>
          {sources.length} Research Source{sources.length !== 1 ? 's' : ''}
          {academicCount > 0 && ` (${academicCount} academic)`}
        </span>
        {citationsUsed.length > 0 && (
          <span className="text-blue-600 font-semibold">
            {citationsUsed.length} citation{citationsUsed.length !== 1 ? 's' : ''}
          </span>
        )}
      </button>

      {expanded && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h4 className="font-semibold text-gray-900">Research Sources Used</h4>
            <span className="text-xs text-gray-500">
              {citationsUsed.length} cited in content
            </span>
          </div>

          {/* Deep Research Summary */}
          {hasDeepResearch && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
              <div className="text-sm font-semibold text-blue-900 mb-2">
                🔬 Deep Research Mode
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                <div>
                  <span className="font-medium">Lessons researched:</span>{' '}
                  {researchSummary.lessonsWithSources}/{researchSummary.totalLessons}
                </div>
                <div>
                  <span className="font-medium">Total sources:</span>{' '}
                  {researchSummary.totalSources}
                </div>
              </div>
              {researchSummary.topDomains && researchSummary.topDomains.length > 0 && (
                <div className="mt-2 text-xs text-blue-700">
                  <span className="font-medium">Top domains:</span>{' '}
                  {researchSummary.topDomains.slice(0, 3).map(d => `${d.domain} (${d.count})`).join(', ')}
                </div>
              )}
            </div>
          )}

          {sources.map((source, index) => {
            const citationNum = index + 1;
            const isCited = citationsUsed.includes(citationNum);

            return (
              <div
                key={source.url}
                className={`p-3 rounded-md border ${
                  isCited
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCited
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {citationNum}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {source.title}
                      </h5>
                      {isCited && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {source.snippet}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          source.domain.includes('.edu') ||
                          source.domain.includes('.gov')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {source.domain}
                      </span>

                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View source
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {citationsUsed.length === 0 && sources.length > 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
              ⚠️ Sources were found but no citations were added to the content. 
              The AI may not have used these sources in the final output.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

