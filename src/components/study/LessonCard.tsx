import { Lecture } from '@/data/study/cs201';
import CodeBlock from './CodeBlock';

interface LessonCardProps {
  lecture: Lecture;
}

export default function LessonCard({ lecture }: LessonCardProps) {
  return (
    <article className="rounded-2xl border-2 border-gray-200 shadow-sm p-5 sm:p-6 bg-white hover:shadow-lg hover:border-indigo-300 transition-all duration-200 group">
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">{lecture.id}</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 leading-tight flex-1 group-hover:text-indigo-700 transition-colors">
          {lecture.title}
        </h4>
      </div>
      <ul className="space-y-2.5 mb-4">
        {lecture.bullets.map((bullet, index) => (
          <li key={index} className="flex items-start">
            <span className="text-indigo-500 mr-3 flex-shrink-0 mt-1" aria-hidden="true">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="leading-relaxed text-gray-700">{bullet}</span>
          </li>
        ))}
      </ul>
      {lecture.snippet && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <CodeBlock snippet={lecture.snippet} />
        </div>
      )}
    </article>
  );
}

