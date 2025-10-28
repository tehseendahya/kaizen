/**
 * CS201 Study Pack with Sub-Units
 * 
 * Each unit is broken into logical sub-units with tailored quizzes and practice
 */

'use client';

import { useState } from 'react';
import { axis } from '@/lib/theme';
import ChatSidebar from '@/components/ai/ChatSidebar';
import HighlightPopover from '@/components/ai/HighlightPopover';
import Link from 'next/link';
import { cs201Data, SubUnit } from '@/data/study/cs201-subunits';
import CodeBlock from '@/components/study/CodeBlock';
import Quiz from '@/components/study/Quiz';

type ViewMode = 'overview' | 'subunit';

export default function CS201Course() {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnit | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<number[]>([0]); // First unit expanded by default

  const selectedUnit = cs201Data.units[selectedUnitIndex];

  const toggleUnit = (index: number) => {
    setExpandedUnits(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSubUnitClick = (subUnit: SubUnit, unitIndex: number) => {
    setSelectedSubUnit(subUnit);
    setSelectedUnitIndex(unitIndex);
    setViewMode('subunit');
    if (!expandedUnits.includes(unitIndex)) {
      setExpandedUnits(prev => [...prev, unitIndex]);
    }
  };

  const backToOverview = () => {
    setViewMode('overview');
    setSelectedSubUnit(null);
  };

  const renderOverview = () => (
    <div className="w-full space-y-6">
      {/* Up next section – homepage-style card */}
      <div className={`${axis.card} ${axis.cardHover} p-6`}>
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 inline-flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            </div>
            <div>
              <p className={`${axis.meta}`}>Up next for you</p>
              <h2 className="text-[18px] font-semibold text-gray-900">Unit {selectedUnit.unitNumber}: {selectedUnit.title}</h2>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-4xl select-none" aria-hidden>📚</div>
        </div>
      </div>

      {/* About section – homepage-style card */}
      <div className={`${axis.card} p-6`}>
        <h3 className={`text-[18px] font-semibold text-gray-900 mb-3`}>About this unit</h3>
        <ul className={`${axis.body} space-y-2`}>
          {selectedUnit.overview.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sub-units grid – homepage-style cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-indigo-600">&lt;/&gt;</span>
          <h3 className={`text-[15px] font-semibold text-gray-900`}>Topics in this unit</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedUnit.subUnits.map((subUnit, index) => (
            <button
              key={subUnit.id}
              onClick={() => handleSubUnitClick(subUnit, selectedUnitIndex)}
              className={`text-left p-5 ${axis.card} ${axis.cardHover} rounded-2xl group cursor-pointer`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="h-6 px-2 rounded-md bg-indigo-600 text-white text-[12px] font-semibold inline-flex items-center justify-center">
                  {index + 1}
                </div>
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-indigo-700 flex-1 leading-tight">
                  {subUnit.title}
                </h4>
              </div>
              <p className="text-[13px] text-gray-600 ml-10 leading-relaxed">
                {subUnit.description}
              </p>
              <div className={`mt-3 ml-10 ${axis.link} text-sm font-medium inline-flex items-center`}>
                Start learning
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Get started button */}
      <div className="mb-8">
        <button
          onClick={() => handleSubUnitClick(selectedUnit.subUnits[0], selectedUnitIndex)}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          Get started
        </button>
      </div>
    </div>
  );

  const renderSubUnit = () => {
    if (!selectedSubUnit) return null;

    // current subunit index not needed for rendering, remove to avoid unused var

    return (
      <div className="space-y-8">
        {/* Back button */}
        <button
          onClick={backToOverview}
          className="lg:hidden flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to overview</span>
        </button>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{selectedSubUnit.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{selectedSubUnit.description}</p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="font-medium text-sm">Generate Quiz</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium text-sm">Make Flashcards</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium text-sm">Take Notes</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium text-sm">Study Guide</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm">Ask AI</span>
            </button>
          </div>
        </div>

        {/* Key Points */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Concepts
          </h2>
          <ul className="space-y-3">
            {selectedSubUnit.content.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-3 flex-shrink-0 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="leading-relaxed text-gray-800">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Example */}
        {selectedSubUnit.content.codeExample && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Example</h2>
            <CodeBlock snippet={selectedSubUnit.content.codeExample} />
          </div>
        )}

        {/* Worked Example */}
        {selectedSubUnit.content.workedExample && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {selectedSubUnit.content.workedExample.title}
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {selectedSubUnit.content.workedExample.explanation}
            </p>
            {selectedSubUnit.content.workedExample.code && (
              <CodeBlock snippet={selectedSubUnit.content.workedExample.code} />
            )}
          </div>
        )}

        {/* Practice Problems */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice</h2>
          {selectedSubUnit.practice.map((section, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl p-6 bg-white">
              <h3 className="font-bold text-lg text-gray-900 mb-4">{section.title}</h3>
              <ol className="space-y-3 list-decimal list-inside">
                {section.problems.map((problem, pIndex) => (
                  <li key={pIndex} className="leading-relaxed text-gray-700 pl-2">
                    {problem}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Quiz */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Understanding</h2>
          <Quiz questions={selectedSubUnit.quiz} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${axis.pageBg} flex flex-col relative`}>
      {/* Header */}
      <header className="bg-white border-b">
        <div className={`h-16 pt-4 pb-2 flex items-center justify-between ${axis.container}`}>
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className={`${axis.link} text-sm flex items-center gap-2`}>
              <span className="-rotate-180">➜</span> All Courses
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div className="truncate">
              <h1 className={`${axis.h2} truncate`}>{cs201Data.courseTitle}</h1>
              <p className={`${axis.meta} hidden sm:block`}>{cs201Data.courseSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 cursor-pointer"
            aria-label="Toggle outline"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className={`flex-1 ${axis.container} px-8 py-8`}>
        <div className="grid grid-cols-1 lg:[grid-template-columns:270px_1fr] gap-8">
        {/* Left Sidebar */}
        <aside
          className={`
            w-[270px] flex-shrink-0 overflow-y-auto
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5`}>
            <div className="mb-3">
              <h2 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Course Outline</h2>
            </div>

            <nav className="space-y-1">
              {cs201Data.units.map((unit, index) => {
                const isExpanded = expandedUnits.includes(index);
                
                return (
                  <div key={unit.unitId}>
                    {/* Unit Header with slim progress */}
                <button
                      onClick={() => {
                        setSelectedUnitIndex(index);
                        backToOverview();
                        toggleUnit(index);
                      }}
                      className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                        <div className="flex-1">
                          <div className="text-[15px] font-semibold text-gray-900">
                            Unit {unit.unitNumber}: {unit.title}
                          </div>
                          <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className={`h-full bg-indigo-600 transition-all duration-300`} style={{ width: `${selectedUnitIndex === index ? 75 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                </button>
                
                    {/* Sub-units (shown when expanded) */}
                    {isExpanded && (
                      <div className="ml-7 mt-1 space-y-1">
                        {unit.subUnits.map((subUnit) => {
                          const isActiveSubUnit = selectedSubUnit?.id === subUnit.id && viewMode === 'subunit';
                          return (
                       <button
                               key={subUnit.id}
                               onClick={() => {
                                 handleSubUnitClick(subUnit, index);
                                 setSidebarOpen(false);
                               }}
                              className={`w-full text-left px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                                isActiveSubUnit
                                  ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500 pl-3'
                                  : `${axis.subitem} hover:bg-gray-50`
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full bg-indigo-400/70" />
                              <span className="text-[14px]">{subUnit.title}</span>
                   </button>
                          );
                        })}
              </div>
            )}
          </div>
                );
              })}
            </nav>
        </div>
        </aside>

        {/* Main Content */}
        <main id="course-content" className="flex-1 overflow-visible">
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'subunit' && renderSubUnit()}
        </main>
        </div>
      </div>
      {/* Gary entry button + highlight popover + chat sidebar (CS201 only) */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-2xl hover:shadow-3xl hover:scale-110 hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 border-2 border-white"
      >
        <span className="text-2xl">🐧</span>
        <span>Ask Gary</span>
      </button>
      <HighlightPopover onAsk={(txt) => { setChatPrefill(txt); setChatOpen(true); }} />
      <ChatSidebar courseId="cs201" open={chatOpen} onClose={() => setChatOpen(false)} prefill={chatPrefill} />
    </div>
  );
}
