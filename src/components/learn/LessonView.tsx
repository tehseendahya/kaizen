'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface LessonViewProps {
  content: string;
}

export default function LessonView({ content }: LessonViewProps) {
  return (
    <article className="prose prose-invert max-w-prose prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-600">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}



