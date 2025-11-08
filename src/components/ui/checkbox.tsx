"use client";
import * as React from 'react';

type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
};

export function Checkbox({ checked = false, onCheckedChange, className = '', id }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      onClick={handleClick}
      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked 
          ? 'bg-blue-600 border-blue-600 hover:bg-blue-700' 
          : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
      } ${className}`}
    >
      {checked && (
        <svg 
          className="h-3.5 w-3.5 text-white" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

