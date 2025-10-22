'use client';

import { useEffect, useRef, KeyboardEvent } from 'react';

interface SolutionsDrawerProps {
  title: string;
  items: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SolutionsDrawer({ 
  title, 
  items, 
  isOpen, 
  onClose 
}: SolutionsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Store the element that opened the drawer
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement;
      // Focus the close button when drawer opens
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else if (openerRef.current) {
      // Return focus to the opener when drawer closes
      openerRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Trap focus within drawer
  const handleTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onKeyDown={handleTabKey}
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform"
        style={{ 
          animation: isOpen ? 'slideIn 0.3s ease-out' : undefined 
        }}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 id="drawer-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Close solutions drawer"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="leading-relaxed border-l-4 border-blue-500 pl-4 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

