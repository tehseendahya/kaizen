'use client';

import { useState, useEffect } from 'react';
import { StudyUnitData } from '@/data/study/cs201';

interface UnitNavProps {
  units: StudyUnitData[];
}

export default function UnitNav({ units }: UnitNavProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = units.map(unit => unit.unitId);
      
      // Find which section is currently in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in viewport (with some offset for header)
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    // Check on mount and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [units]);

  const scrollToUnit = (unitId: string) => {
    const element = document.getElementById(unitId);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav 
      className="sticky top-20 bg-white border rounded-lg p-4 shadow-sm"
      aria-label="Unit navigation"
      style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
    >
      <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-600">
        Units
      </h2>
      <ul className="space-y-2">
        {units.map((unit, index) => {
          const isActive = activeSection === unit.unitId;
          
          return (
            <li key={unit.unitId}>
              <button
                onClick={() => scrollToUnit(unit.unitId)}
                className={`w-full text-left px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="block text-xs text-gray-500 mb-1">
                  Unit {index + 1}
                </span>
                <span className="block text-sm leading-tight">
                  {unit.title.replace(/^Unit \d+: /, '')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-6 border-t">
        <a
          href="#top"
          className="block w-full text-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ↑ Back to Top
        </a>
      </div>
    </nav>
  );
}

