/**
 * CS201 Study Pack with Sub-Units
 * 
 * Each unit is broken into logical sub-units with tailored quizzes and practice
 */

'use client';

import { useState } from 'react';
import ChatSidebar from '@/components/ai/ChatSidebar';
import HighlightPopover from '@/components/ai/HighlightPopover';
import Link from 'next/link';
import { cs201Data, SubUnit } from '@/data/study/cs201-subunits';
import CodeBlock from '@/components/study/CodeBlock';
import Quiz from '@/components/study/Quiz';
import LessonView from '@/components/learn/LessonView';
import PracticeBlock from '@/components/learn/PracticeBlock';
import ChallengeBlock from '@/components/learn/ChallengeBlock';

type ViewMode = 'overview' | 'subunit';
type TabMode = 'learn' | 'practice' | 'challenge';

export default function CS201Course() {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnit | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<number[]>([0]); // First unit expanded by default
  const [activeTab, setActiveTab] = useState<TabMode>('learn');

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
    setActiveTab('learn'); // Reset to learn tab when switching sub-units
    if (!expandedUnits.includes(unitIndex)) {
      setExpandedUnits(prev => [...prev, unitIndex]);
    }
  };

  const backToOverview = () => {
    setViewMode('overview');
    setSelectedSubUnit(null);
  };

  const renderOverview = () => (
    <div className="w-full">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedUnit.subUnits.map((subUnit, index) => (
            <button
              key={subUnit.id}
              onClick={() => handleSubUnitClick(subUnit, selectedUnitIndex)}
              className="text-left p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group bg-white cursor-pointer"
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

    // Generate markdown content for the lesson
    const generateLessonContent = () => {
      const content = selectedSubUnit.content;
      let markdown = `# ${selectedSubUnit.title}\n\n`;
      markdown += `${selectedSubUnit.description}\n\n`;
      
      markdown += `## Big idea\n`;
      markdown += `**${content.keyPoints[0]}**\n\n`;
      
      if (content.keyPoints.length > 1) {
        markdown += `## Key concepts\n`;
        content.keyPoints.slice(1).forEach(point => {
          markdown += `- ${point}\n`;
        });
        markdown += `\n`;
      }
      
      if (content.codeExample) {
        markdown += `## Code example\n`;
        markdown += `\`\`\`java\n${content.codeExample.code}\n\`\`\`\n\n`;
      }
      
      if (content.workedExample) {
        markdown += `## Worked example\n`;
        markdown += `**${content.workedExample.title}**\n\n`;
        markdown += `${content.workedExample.explanation}\n\n`;
        if (content.workedExample.code) {
          markdown += `\`\`\`java\n${content.workedExample.code}\n\`\`\`\n\n`;
        }
      }
      
      if (selectedSubUnit.practice.length > 0) {
        markdown += `## Practice problems\n`;
        selectedSubUnit.practice.forEach((section: { title: string; problems: string[] }) => {
          markdown += `### ${section.title}\n`;
          section.problems.forEach((problem: string) => {
            markdown += `- ${problem}\n`;
          });
          markdown += `\n`;
        });
      }
      
      return markdown;
    };

    const tabs = [
      { id: 'learn' as TabMode, label: 'Learn', icon: '📚' },
      { id: 'practice' as TabMode, label: 'Practice', icon: '💪' },
      { id: 'challenge' as TabMode, label: 'Challenge', icon: '🎯' }
    ];

    return (
      <div className="space-y-6">
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
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'learn' && (
            <LessonView content={generateLessonContent()} />
          )}
          
          {activeTab === 'practice' && (
            <PracticeBlock 
              unit={`Unit ${selectedUnit.unitNumber}`} 
              subunit={selectedSubUnit.title} 
            />
          )}
          
          {activeTab === 'challenge' && (
            <ChallengeBlock 
              unit={`Unit ${selectedUnit.unitNumber}`} 
              subunit={selectedSubUnit.title} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
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
              className="lg:hidden p-2 rounded-md text-gray-600 cursor-pointer"
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
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          </div>
        
            <nav className="space-y-2">
              {cs201Data.units.map((unit, index) => {
                const isExpanded = expandedUnits.includes(index);
                
                return (
                  <div key={unit.unitId}>
                    {/* Unit Header */}
                <button
                      onClick={() => {
                        setSelectedUnitIndex(index);
                        backToOverview();
                        toggleUnit(index);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group cursor-pointer"
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
                          <div className="font-medium text-gray-900">
                            Unit {unit.unitNumber}: {unit.title}
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
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer ${
                                isActiveSubUnit
                                  ? 'bg-blue-900 text-white'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isActiveSubUnit 
                                    ? 'border-white bg-white' 
                                    : 'border-gray-400'
                                }`}>
                                  {isActiveSubUnit && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-900"></div>
                )}
              </div>
                                <span className="text-sm">{subUnit.title}</span>
      </div>
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
        <main id="course-content" className="flex-1 overflow-y-auto p-6 lg:p-8">
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'subunit' && renderSubUnit()}
        </main>
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
