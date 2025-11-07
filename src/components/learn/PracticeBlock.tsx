'use client';
import { useEffect, useState } from 'react';

type Question = {
  id: string;
  unit: string;
  subunit: string;
  type: 'mcq' | 'short' | 'code' | 'trace';
  stem: string;
  choices?: string[];
  answer: string;
  explanation: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
};

interface PracticeBlockProps {
  unit: string;
  subunit: string;
}

export default function PracticeBlock({ unit, subunit }: PracticeBlockProps) {
  const [items, setItems] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?unit=${encodeURIComponent(unit)}&subunit=${encodeURIComponent(subunit)}&n=5`
        );
        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [unit, subunit]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleReveal = (questionId: string) => {
    setRevealed(prev => ({ ...prev, [questionId]: true }));
  };

  const handleShowHint = (questionId: string) => {
    setHintsShown(prev => ({ ...prev, [questionId]: true }));
  };

  const isCorrect = (question: Question) => {
    return userAnswers[question.id] === question.answer;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 bg-gray-800 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No practice questions available for this sub-unit yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((question) => (
        <div key={question.id} className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="font-medium text-gray-900 flex-1">{question.stem}</div>
            {question.difficulty && (
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty.toUpperCase()}
              </span>
            )}
          </div>
          
          {question.type === 'mcq' && question.choices && (
            <div className="space-y-3 mb-4">
              {question.choices.map((choice, i) => (
                <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200">
                  <input 
                    type="radio" 
                    name={question.id} 
                    value={choice}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{choice}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.type !== 'mcq' && (
            <textarea
              className="mt-2 w-full rounded-lg bg-gray-50 p-3 text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none resize-none"
              placeholder={`Type your ${question.type === 'code' ? 'code' : question.type === 'trace' ? 'trace' : 'answer'} here...`}
              rows={question.type === 'code' ? 6 : 3}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          )}
          
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button 
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
              onClick={() => handleReveal(question.id)}
            >
              Check Answer
            </button>
            
            {question.hint && !hintsShown[question.id] && (
              <button 
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors shadow-sm"
                onClick={() => handleShowHint(question.id)}
              >
                Show Hint
              </button>
            )}
            
            {revealed[question.id] && (
              <span className="text-sm font-medium">
                {question.type === 'mcq' ? (
                  isCorrect(question) ? (
                    <span className="text-green-600">✅ Correct!</span>
                  ) : (
                    <span className="text-red-600">❌ Incorrect. Correct answer: {question.answer}</span>
                  )
                ) : (
                  <span className="text-green-600">✅ Answer revealed below</span>
                )}
              </span>
            )}
          </div>
          
          {hintsShown[question.id] && question.hint && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong className="text-yellow-900">💡 Hint:</strong> {question.hint}
              </div>
            </div>
          )}
          
          {revealed[question.id] && (
            <>
              {question.type !== 'mcq' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-700">
                    <strong className="text-gray-900">Model Answer:</strong>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-sm">{question.answer}</pre>
                  </div>
                </div>
              )}
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong className="text-gray-900">Explanation:</strong> {question.explanation}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
