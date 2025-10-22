'use client';

import { useState } from 'react';
import { CodeSnippet } from '@/data/study/cs201';

interface CodeBlockProps {
  snippet: CodeSnippet;
}

export default function CodeBlock({ snippet }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = snippet.code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-3">
        {snippet.caption && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{snippet.caption}</span>
          </div>
        )}
        <button
          onClick={handleCopy}
          className={`ml-auto px-4 py-2 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm ${
            copied 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-indigo-100 hover:to-blue-100 hover:text-indigo-700'
          }`}
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </span>
          )}
        </button>
      </div>
      <pre className="overflow-auto rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-5 shadow-inner">
        <code className="text-sm font-mono leading-relaxed text-gray-800">
          {snippet.code}
        </code>
      </pre>
    </div>
  );
}

