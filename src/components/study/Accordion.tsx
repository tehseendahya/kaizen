'use client';

import { useState, useId, KeyboardEvent } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function Accordion({ 
  title, 
  children, 
  defaultOpen = false,
  className = ''
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const buttonId = useId();
  const panelId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all ${className}`}>
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between p-5 text-left font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset transition-all ${
            isOpen 
              ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900' 
              : 'hover:bg-gray-50 text-gray-900'
          }`}
        >
          <span className="flex items-center space-x-3">
            <svg 
              className={`w-5 h-5 transition-colors ${isOpen ? 'text-indigo-600' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{title}</span>
          </span>
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`overflow-hidden transition-all ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ transition: 'max-height 0.3s ease, opacity 0.2s ease' }}
      >
        <div className="p-5 pt-4 border-t border-gray-200 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

