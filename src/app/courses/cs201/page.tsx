/**
 * CS201 Study Pack with Sub-Units
 * 
 * Each unit is broken into logical sub-units with tailored quizzes and practice
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cs201Data, SubUnit } from '@/data/study/cs201-subunits';
import CodeBlock from '@/components/study/CodeBlock';
import Quiz from '@/components/study/Quiz';
import Checklist from '@/components/study/Checklist';

type ViewMode = 'overview' | 'subunit' | 'lab' | 'project' | 'checklist';

export default function CS201Course() {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnit | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<number[]>([0]); // First unit expanded by default

  const selectedUnit = cs201Data.units[selectedUnitIndex];

  const toggleUnit = (index: number) => {
    setExpandedUnits(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSubUnitClick = (subUnit: SubUnit) => {
    setSelectedSubUnit(subUnit);
    setViewMode('subunit');
  };

  const backToOverview = () => {
    setViewMode('overview');
    setSelectedSubUnit(null);
  };

  const renderOverview = () => (
    <div className="max-w-5xl">
      {/* Up next section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Up next for you:</p>
            <h2 className="text-2xl font-bold text-gray-900">Unit {selectedUnit.unitNumber}: {selectedUnit.title}</h2>
          </div>
        </div>
      </div>

      {/* About section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About this unit</h3>
        <ul className="space-y-2 text-gray-700">
          {selectedUnit.overview.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sub-units grid */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Topics in this unit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedUnit.subUnits.map((subUnit, index) => (
            <button
              key={subUnit.id}
              onClick={() => handleSubUnitClick(subUnit)}
              className="text-left p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group bg-white"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 flex-1 leading-tight">
                  {subUnit.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 ml-11 leading-relaxed">
                {subUnit.description}
              </p>
              <div className="mt-3 ml-11 text-sm text-blue-600 font-medium flex items-center">
                <span>Start learning</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access to lab and project */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Hands-on activities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setViewMode('lab')}
            className="p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 transition-all text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="font-semibold text-purple-900">Lab</span>
            </div>
            <p className="text-sm text-gray-700">{selectedUnit.finalLab.title}</p>
          </button>
          
          <button
            onClick={() => setViewMode('project')}
            className="p-5 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400 transition-all text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-semibold text-orange-900">Project</span>
            </div>
            <p className="text-sm text-gray-700">{selectedUnit.finalProject.title}</p>
          </button>
          
          <button
            onClick={() => setViewMode('checklist')}
            className="p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 transition-all text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="font-semibold text-green-900">Checklist</span>
            </div>
            <p className="text-sm text-gray-700">Unit mastery checklist</p>
          </button>
        </div>
      </div>

      {/* Get started button */}
      <div className="mb-8">
        <button
          onClick={() => handleSubUnitClick(selectedUnit.subUnits[0])}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Get started
        </button>
      </div>
    </div>
  );

  const renderSubUnit = () => {
    if (!selectedSubUnit) return null;

    const currentIndex = selectedUnit.subUnits.findIndex(su => su.id === selectedSubUnit.id);

    return (
      <div className="space-y-8">
        {/* Back button */}
        <button
          onClick={backToOverview}
          className="lg:hidden flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="font-medium text-sm">Generate Quiz</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium text-sm">Make Flashcards</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium text-sm">Take Notes</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium text-sm">Study Guide</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
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

  const renderLab = () => (
    <div className="max-w-4xl space-y-6">
      <button
        onClick={backToOverview}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to overview</span>
      </button>
      
      <h1 className="text-4xl font-bold text-gray-900">{selectedUnit.finalLab.title}</h1>
      
      <div className="border-2 border-purple-300 rounded-xl p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-bold text-lg mb-4 text-purple-900">Specification</h3>
        <ul className="space-y-2 mb-6">
          {selectedUnit.finalLab.spec.map((item, index) => (
            <li key={index} className="text-gray-800 pl-3 border-l-2 border-purple-400">
              {item}
            </li>
          ))}
        </ul>
        
        <h3 className="font-bold text-lg mb-4 text-purple-900">Tasks</h3>
        <ol className="space-y-2 mb-6 list-decimal list-inside">
          {selectedUnit.finalLab.tasks.map((task, index) => (
            <li key={index} className="text-gray-800 pl-2">{task}</li>
          ))}
        </ol>
        
        {selectedUnit.finalLab.extension && (
          <>
            <h3 className="font-bold text-lg mb-4 text-purple-900">Extension</h3>
            <ul className="space-y-2">
              {selectedUnit.finalLab.extension.map((item, index) => (
                <li key={index} className="text-gray-800 pl-3 border-l-2 border-purple-400">
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );

  const renderProject = () => (
    <div className="max-w-4xl space-y-6">
      <button
        onClick={backToOverview}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to overview</span>
      </button>
      
      <h1 className="text-4xl font-bold text-gray-900">{selectedUnit.finalProject.title}</h1>
      
      <div className="border-2 border-orange-300 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-amber-50">
        <h3 className="font-bold text-lg mb-4 text-orange-900">Specification</h3>
        <ul className="space-y-2 mb-6">
          {selectedUnit.finalProject.spec.map((item, index) => (
            <li key={index} className="text-gray-800 pl-3 border-l-2 border-orange-400">
              {item}
            </li>
          ))}
        </ul>
        
        <h3 className="font-bold text-lg mb-4 text-orange-900">Focus Areas</h3>
        <ul className="space-y-2">
          {selectedUnit.finalProject.focus.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-orange-600 mr-3 flex-shrink-0">★</span>
              <span className="text-gray-800">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderChecklist = () => (
    <div className="max-w-4xl space-y-6">
      <button
        onClick={backToOverview}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to overview</span>
      </button>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Unit Mastery Checklist</h1>
      <p className="text-lg text-gray-600 mb-6">Track your progress through Unit {selectedUnit.unitNumber}</p>
      
      <Checklist unitId={selectedUnit.unitId} items={selectedUnit.checklist} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{cs201Data.courseTitle}</h1>
                <p className="text-xs text-gray-600 hidden sm:block">{cs201Data.courseSubtitle}</p>
              </div>
            </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
          </div>
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`
          w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">CS201</h2>
                  <p className="text-xs text-gray-600">{cs201Data.units.length} UNITS</p>
                </div>
              </div>
          </div>
        
            <nav className="space-y-1">
              {cs201Data.units.map((unit, index) => {
                const isExpanded = expandedUnits.includes(index);
                const isSelected = selectedUnitIndex === index;
                
                return (
                  <div key={unit.unitId}>
                    {/* Unit Header */}
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setSelectedUnitIndex(index);
                          backToOverview();
                          if (!isExpanded) {
                            toggleUnit(index);
                          }
                        }}
                        className={`flex-1 text-left px-4 py-3 rounded-lg transition-all border-l-4 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600'
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          UNIT {unit.unitNumber}
                        </div>
                        <div className={`text-sm leading-tight ${
                          isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}>
                          {unit.title}
                        </div>
                      </button>
                      
                      {/* Expand/Collapse Button */}
                <button
                        onClick={() => toggleUnit(index)}
                        className="p-2 mr-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                    </div>

                    {/* Sub-units (shown when expanded) */}
                    {isExpanded && isSelected && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        {unit.subUnits.map((subUnit, subIndex) => {
                          const isActiveSubUnit = selectedSubUnit?.id === subUnit.id && viewMode === 'subunit';
                          return (
                      <button
                              key={subUnit.id}
                              onClick={() => {
                                handleSubUnitClick(subUnit);
                                setSidebarOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                                isActiveSubUnit
                                  ? 'bg-blue-100 text-blue-900 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isActiveSubUnit ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {subIndex + 1}
                                </span>
                                <span className="leading-tight">{subUnit.title}</span>
                              </div>
                      </button>
                          );
                        })}
                        
                        {/* Additional resources */}
                        <div className="pt-2 mt-2 border-t border-gray-200">
                  <button
                            onClick={() => {
                              setViewMode('lab');
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center space-x-2 ${
                              viewMode === 'lab' ? 'bg-purple-50 text-purple-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                            <span>Lab</span>
                  </button>
                        <button
                            onClick={() => {
                              setViewMode('project');
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center space-x-2 ${
                              viewMode === 'project' ? 'bg-orange-50 text-orange-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Project</span>
                        </button>
                  <button
                            onClick={() => {
                              setViewMode('checklist');
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center space-x-2 ${
                              viewMode === 'checklist' ? 'bg-green-50 text-green-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                            <span>Checklist</span>
                  </button>
                </div>
              </div>
            )}
          </div>
                );
              })}
            </nav>
        </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'subunit' && renderSubUnit()}
          {viewMode === 'lab' && renderLab()}
          {viewMode === 'project' && renderProject()}
          {viewMode === 'checklist' && renderChecklist()}
        </main>
      </div>
    </div>
  );
}
