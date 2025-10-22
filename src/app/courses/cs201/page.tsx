/**
 * CS201 Study Pack — Units 1–3
 * 
 * A comprehensive study resource section covering Computer Science fundamentals:
 * - Unit 1: CS and OOP in Java
 * - Unit 2: Arrays, ArrayLists, Strings
 * - Unit 3: Maps, Sets, Hashing
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cs201 } from '@/data/study/cs201';
import SectionHeading from '@/components/study/SectionHeading';
import LessonCard from '@/components/study/LessonCard';
import Accordion from '@/components/study/Accordion';
import CodeBlock from '@/components/study/CodeBlock';
import Checklist from '@/components/study/Checklist';
import Quiz from '@/components/study/Quiz';
import SolutionsDrawer from '@/components/study/SolutionsDrawer';

type SubSection = 
  | 'overview'
  | 'lectures'
  | 'examples'
  | 'notes'
  | 'practice'
  | 'lab'
  | 'project'
  | 'quiz'
  | 'checklist';

export default function CS201Course() {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [selectedSubSection, setSelectedSubSection] = useState<SubSection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedUnit = cs201.units[selectedUnitIndex];

  const subSections: { id: SubSection; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'lectures', label: 'Lectures', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'examples', label: 'Worked Examples', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'notes', label: 'Guided Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'practice', label: 'Practice Problems', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'lab', label: 'Lab', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'project', label: 'Mini-Project', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 15a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z' },
    { id: 'quiz', label: 'Quiz', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'checklist', label: 'Checklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ];

  const renderSubSectionContent = () => {
    if (!selectedSubSection) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {selectedUnit.title}
            </h3>
            <p className="text-gray-600 mb-6">
              Select a section from the menu on the right to view study materials, lectures, practice problems, and more.
            </p>
          </div>
        </div>
      );
    }

    switch (selectedSubSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <SectionHeading id="overview" level={2}>Overview</SectionHeading>
            <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
              <ul className="space-y-3">
                {selectedUnit.overview.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-3 flex-shrink-0 text-xl" aria-hidden="true">→</span>
                    <span className="leading-relaxed text-gray-800">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'lectures':
        return (
          <div className="space-y-6">
            <SectionHeading id="lectures" level={2}>Lectures</SectionHeading>
            <div className="grid grid-cols-1 gap-4">
              {selectedUnit.lectures.map(lecture => (
                <LessonCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-6">
            <SectionHeading id="examples" level={2}>Worked Examples</SectionHeading>
            <div className="space-y-4">
              {selectedUnit.workedExamples.map((example, index) => (
                <Accordion key={index} title={example.title}>
                  <p className="mb-4 leading-relaxed text-gray-700">{example.content}</p>
                  {example.snippet && <CodeBlock snippet={example.snippet} />}
                </Accordion>
              ))}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <SectionHeading id="notes" level={2}>Guided Notes (Fill-in-the-Blank)</SectionHeading>
            <div className="p-6 bg-yellow-50 border rounded-lg print:bg-white">
              <p className="text-sm text-gray-600 mb-4 print:hidden">
                Print-friendly format. Fill in the blanks to test your understanding.
              </p>
              <ol className="space-y-4 list-decimal list-inside">
                {selectedUnit.guidedNotes.map((note, index) => (
                  <li key={index} className="leading-relaxed font-mono text-sm text-gray-800 pl-2">
                    {note}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );

      case 'practice':
        return (
          <div className="space-y-6">
            <SectionHeading id="practice" level={2}>Practice Problems</SectionHeading>
            <div className="space-y-6">
              {selectedUnit.practice.map((group, groupIndex) => (
                <div key={groupIndex} className="border rounded-lg p-6 bg-white">
                  <h3 className="font-semibold text-xl mb-4 flex items-center">
                    {group.title}
                    <span 
                      className={`ml-3 px-3 py-1 text-xs rounded-full ${
                        group.title === 'Warm-ups' 
                          ? 'bg-green-100 text-green-800'
                          : group.title === 'Core'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {group.title === 'Warm-ups' ? 'Easy' : group.title === 'Core' ? 'Medium' : 'Hard'}
                    </span>
                  </h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    {group.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="leading-relaxed text-gray-700 pl-2">
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        );

      case 'lab':
        return (
          <div className="space-y-6">
            <SectionHeading id="lab" level={2}>{selectedUnit.lab.title}</SectionHeading>
            <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
              <h3 className="font-semibold text-lg mb-3 text-purple-900">Specification</h3>
              <ul className="space-y-2 mb-6">
                {selectedUnit.lab.spec.map((item, index) => (
                  <li key={index} className="leading-relaxed text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
              
              <h3 className="font-semibold text-lg mb-3 text-purple-900">Tasks</h3>
              <ol className="space-y-2 mb-6 list-decimal list-inside">
                {selectedUnit.lab.tasks.map((task, index) => (
                  <li key={index} className="leading-relaxed text-gray-800 pl-2">
                    {task}
                  </li>
                ))}
              </ol>
              
              {selectedUnit.lab.extension && selectedUnit.lab.extension.length > 0 && (
                <>
                  <h3 className="font-semibold text-lg mb-3 text-purple-900">Extension</h3>
                  <ul className="space-y-2">
                    {selectedUnit.lab.extension.map((item, index) => (
                      <li key={index} className="leading-relaxed text-gray-800">
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        );

      case 'project':
        return (
          <div className="space-y-6">
            <SectionHeading id="project" level={2}>{selectedUnit.miniProject.title}</SectionHeading>
            <div className="border-2 border-orange-300 rounded-lg p-6 bg-orange-50">
              <h3 className="font-semibold text-lg mb-3 text-orange-900">Specification</h3>
              <ul className="space-y-2 mb-6">
                {selectedUnit.miniProject.spec.map((item, index) => (
                  <li key={index} className="leading-relaxed text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
              
              <h3 className="font-semibold text-lg mb-3 text-orange-900">Focus Areas</h3>
              <ul className="space-y-2">
                {selectedUnit.miniProject.focus.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-600 mr-2 flex-shrink-0" aria-hidden="true">★</span>
                    <span className="leading-relaxed text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <SectionHeading id="quiz" level={2}>Quiz</SectionHeading>
            <Quiz questions={selectedUnit.quiz} />
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-6">
            <SectionHeading id="checklist" level={2}>Checklist</SectionHeading>
            <div className="border rounded-lg p-6 bg-gray-50">
              <Checklist unitId={selectedUnit.unitId} items={selectedUnit.checklist} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Courses</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                CS201 Study Pack
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Unit Selection */}
        <aside className={`
          w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block
        `}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
              Units
            </h2>
            <nav className="space-y-1">
              {cs201.units.map((unit, index) => (
                <button
                  key={unit.unitId}
                  onClick={() => {
                    setSelectedUnitIndex(index);
                    setSelectedSubSection(null);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedUnitIndex === index
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Unit {index + 1}</div>
                  <div className="text-sm leading-tight">
                    {unit.title.replace(/^Unit \d+: /, '')}
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t">
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
              >
                View Solutions
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="lg:flex lg:h-full">
            {/* Center Content */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {renderSubSectionContent()}
            </div>

            {/* Right Sidebar - Sub-section Menu */}
            <aside className="w-full lg:w-64 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:overflow-y-auto flex-shrink-0">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                Sections
              </h2>
              <nav className="space-y-1">
                {subSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSubSection(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center ${
                      selectedSubSection === section.id
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg 
                      className="w-5 h-5 mr-3 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                    </svg>
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        </main>
      </div>

      {/* Solutions Drawer */}
      <SolutionsDrawer
        title={selectedUnit.selectedSolutions.title}
        items={selectedUnit.selectedSolutions.items}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Reduced Motion Styles */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
