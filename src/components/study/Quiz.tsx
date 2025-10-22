'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/data/study/cs201';

interface QuizProps {
  questions: QuizQuestion[];
}

export default function Quiz({ questions }: QuizProps) {
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const handleChoice = (questionId: string, choiceId: string) => {
    setAnswers(prev => new Map(prev).set(questionId, choiceId));
  };

  const handleSubmit = (questionId: string) => {
    setSubmitted(prev => new Set(prev).add(questionId));
  };

  const handleReset = (questionId: string) => {
    setAnswers(prev => {
      const next = new Map(prev);
      next.delete(questionId);
      return next;
    });
    setSubmitted(prev => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach(q => {
      const userAnswer = answers.get(q.id);
      const correctChoice = q.choices.find(c => c.correct);
      if (userAnswer === correctChoice?.id && submitted.has(q.id)) {
        correct++;
      }
    });
    return { correct, total: submitted.size };
  };

  const score = getScore();
  const scorePercentage = score.total > 0 ? (score.correct / score.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {submitted.size > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{score.correct}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Score: {score.correct}/{score.total}
                </p>
                <p className="text-sm text-gray-600">
                  {scorePercentage >= 80 ? '🎉 Great job!' : scorePercentage >= 60 ? '👍 Good effort!' : '💪 Keep practicing!'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{Math.round(scorePercentage)}%</div>
              <div className="text-xs text-gray-500">accuracy</div>
            </div>
          </div>
        </div>
      )}
      
      {questions.map((question, qIndex) => {
        const userAnswer = answers.get(question.id);
        const isSubmitted = submitted.has(question.id);
        const selectedChoice = question.choices.find(c => c.id === userAnswer);
        const correctChoice = question.choices.find(c => c.correct);
        const isCorrect = isSubmitted && selectedChoice?.correct;

        return (
          <div key={question.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3 mb-5">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {qIndex + 1}
              </div>
              <h4 className="font-semibold text-lg text-gray-900 leading-relaxed flex-1">
                {question.prompt}
              </h4>
            </div>
            
            <fieldset className="space-y-3 mb-5">
              <legend className="sr-only">{question.prompt}</legend>
              {question.choices.map(choice => {
                const isSelected = userAnswer === choice.id;
                const isChoiceCorrect = choice.correct;
                
                let classes = 'flex items-start p-4 border-2 rounded-xl transition-all duration-200';
                let iconColor = '';
                let icon = null;
                
                if (isSubmitted) {
                  if (isSelected && isChoiceCorrect) {
                    classes += ' bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-sm';
                    iconColor = 'text-green-600';
                    icon = (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                  } else if (isSelected && !isChoiceCorrect) {
                    classes += ' bg-gradient-to-r from-red-50 to-pink-50 border-red-400 shadow-sm';
                    iconColor = 'text-red-600';
                    icon = (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                  } else if (!isSelected && isChoiceCorrect) {
                    classes += ' bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 opacity-80';
                    iconColor = 'text-green-600';
                    icon = (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                  } else {
                    classes += ' bg-gray-50 border-gray-200 opacity-60';
                  }
                } else {
                  if (isSelected) {
                    classes += ' bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-sm';
                  } else {
                    classes += ' bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
                  }
                }

                return (
                  <label
                    key={choice.id}
                    className={classes}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={choice.id}
                      checked={isSelected}
                      onChange={() => handleChoice(question.id, choice.id)}
                      disabled={isSubmitted}
                      className="mt-1 mr-4 w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="flex-1 leading-relaxed text-gray-800 font-medium">{choice.text}</span>
                    {icon && (
                      <span className={`ml-3 flex-shrink-0 ${iconColor}`} aria-label={isChoiceCorrect ? "Correct answer" : "Incorrect answer"}>
                        {icon}
                      </span>
                    )}
                  </label>
                );
              })}
            </fieldset>

            {isSubmitted && selectedChoice && (
              <div className={`p-5 rounded-xl border-2 ${
                selectedChoice.correct 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
              }`}>
                <div className="flex items-start space-x-3 mb-3">
                  {selectedChoice.correct ? (
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <p className={`font-bold text-lg ${selectedChoice.correct ? 'text-green-800' : 'text-red-800'}`}>
                    {selectedChoice.correct ? '✨ Correct!' : '❌ Not quite'}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 ml-11 mb-3">
                  <span className="font-semibold">Explanation:</span> {selectedChoice.rationale}
                </p>
                {!selectedChoice.correct && correctChoice && (
                  <div className="ml-11 p-3 bg-white bg-opacity-60 rounded-lg border border-green-200">
                    <p className="text-sm leading-relaxed text-gray-800">
                      <span className="font-semibold text-green-700">✓ Correct answer:</span> {correctChoice.text}
                    </p>
                    <p className="text-sm mt-2 leading-relaxed text-gray-700">
                      <span className="font-semibold">Why:</span> {correctChoice.rationale}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              {!isSubmitted ? (
                <button
                  onClick={() => handleSubmit(question.id)}
                  disabled={!userAnswer}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={() => handleReset(question.id)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
                >
                  ↻ Try Again
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

