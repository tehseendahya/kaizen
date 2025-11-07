'use client';
import { useEffect, useState } from 'react';

type Challenge = {
  id: string;
  unit: string;
  subunit: string;
  title: string;
  prompt: string;
  steps: string[];
  solution: string;
  rubric: string;
  tags: string[];
};

interface ChallengeBlockProps {
  unit: string;
  subunit: string;
}

export default function ChallengeBlock({ unit, subunit }: ChallengeBlockProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(
          `/api/challenges?unit=${encodeURIComponent(unit)}&subunit=${encodeURIComponent(subunit)}`
        );
        const data = await response.json();
        setChallenge(data.items?.[0] || null);
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [unit, subunit]);

  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-gray-800 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-8 text-gray-400">
        No challenge available for this sub-unit yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg border border-gray-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{challenge.title}</h3>
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {challenge.prompt}
        </div>
      </div>
      
      <div className="space-y-4">
        <button 
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg mr-3"
          onClick={() => setShowSteps(!showSteps)}
        >
          {showSteps ? 'Hide Steps' : 'Show Steps'}
        </button>
        
        <button 
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors shadow-lg"
          onClick={() => setShowSolution(!showSolution)}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>
      
      {showSteps && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">Steps to Follow:</h4>
          <ol className="space-y-2">
            {challenge.steps.map((step, index) => (
              <li key={index} className="text-blue-200 flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {showSolution && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-green-500">
            <h4 className="text-lg font-semibold text-green-300 mb-3">Solution:</h4>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {challenge.solution}
            </div>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-yellow-500">
            <h4 className="text-lg font-semibold text-yellow-300 mb-3">Grading Rubric:</h4>
            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {challenge.rubric}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
