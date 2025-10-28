"use client";
import * as React from "react";
import * as ReactDOM from "react-dom";

type DialogContextValue = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue>({ open: false });

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  const [mounted, setMounted] = React.useState(false);
  const portalEl = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-portal", "dialog");
    document.body.appendChild(el);
    portalEl.current = el;
    setMounted(true);
    return () => {
      document.body.removeChild(el);
      portalEl.current = null;
    };
  }, []);

  if (!open || !mounted || !portalEl.current) return null;

  const node = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div
        className={`relative z-10 w-full max-w-md rounded-lg border bg-white text-slate-900 p-4 shadow-lg ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, portalEl.current);
}

export function DialogHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex flex-col space-y-1.5 ${className}`}>{children}</div>;
}

export function DialogTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
}
