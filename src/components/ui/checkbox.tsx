"use client";
import * as React from 'react';

type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
};

export function Checkbox({ checked = false, onCheckedChange, className = '' }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`h-5 w-5 rounded border border-slate-300 flex items-center justify-center bg-white ${
        checked ? 'bg-blue-600 border-blue-600' : ''
      } ${className}`}
    >
      {checked && (
        <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

