"use client";
import * as React from "react";

export function Alert({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`w-full rounded-lg border border-slate-200 bg-white p-4 ${className}`}>{children}</div>
  );
}

export function AlertTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`text-sm font-medium leading-none ${className}`}>{children}</div>;
}

export function AlertDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mt-2 text-sm text-slate-600 ${className}`}>{children}</div>;
}

