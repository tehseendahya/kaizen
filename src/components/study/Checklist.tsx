'use client';

import { useState, useEffect } from 'react';

interface ChecklistProps {
  unitId: string;
  items: string[];
}

export default function Checklist({ unitId, items }: ChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const storageKey = `cs201-checklist-${unitId}`;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChecked(new Set(parsed));
      }
    } catch (err) {
      console.error('Failed to load checklist state:', err);
    }
  }, [storageKey]);

  // Save to localStorage whenever checked changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(checked)));
    } catch (err) {
      console.error('Failed to save checklist state:', err);
    }
  }, [checked, storageKey]);

  const handleToggle = (index: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{checked.size}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">
                Progress: {checked.size}/{items.length} completed
              </span>
              <div className="text-xs text-gray-600">
                {progress === 100 ? '🎉 All done!' : progress >= 50 ? '💪 Keep going!' : '🚀 Let\'s start!'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{Math.round(progress)}%</div>
          </div>
        </div>
        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Checklist progress"
          />
        </div>
      </div>
      
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <label className="flex items-start cursor-pointer group w-full p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all">
              <input
                type="checkbox"
                checked={checked.has(index)}
                onChange={() => handleToggle(index)}
                className="mt-1 mr-4 w-6 h-6 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-all"
              />
              <span className={`leading-relaxed font-medium transition-all ${
                checked.has(index) 
                  ? 'line-through text-gray-400' 
                  : 'text-gray-800 group-hover:text-indigo-900'
              }`}>
                {item}
              </span>
              {checked.has(index) && (
                <span className="ml-auto text-green-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

