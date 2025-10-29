'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BlockMath } from 'react-katex';
import Quiz from '@/components/study/Quiz';

export type CourseLesson = { id: string; title: string; description: string };
export type CourseUnit = { id: string; title: string; intro?: string; lessons: CourseLesson[] };
export type CourseData = { title: string; units: CourseUnit[] };

type Props = {
  courseData: CourseData;
  getLessonContent: (lessonId: string) => string;
  getLessonEquations: (lessonId: string) => string[];
  courseShort?: string; // optional short label for mobile header
};

export default function CourseShell({
  courseData,
  getLessonContent,
  getLessonEquations,
  courseShort,
}: Props) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(['unit1']);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => (prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]));
  };

  const handleLessonClick = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200">
                <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Courses</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                <span className="hidden sm:inline">{courseData.title}</span>
                <span className="sm:hidden">{courseShort ?? courseData.title.split(':')[0]}</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:block text-sm text-gray-600">Welcome back, Student</div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="w-full px-8 py-10 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="w-[280px] bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">Course Content</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <nav className="p-4">
                  {courseData.units.map((unit) => (
                    <div key={unit.id} className="mb-2">
                      <button onClick={() => toggleUnit(unit.id)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between">
                        <span className="font-medium text-gray-700">{unit.title}</span>
                        <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedUnits.includes(unit.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedUnits.includes(unit.id) && (
                        <div className="ml-4 mt-2 space-y-1">
                          {unit.intro && <div className="p-2 text-xs text-gray-600 bg-gray-50 rounded mb-2">{unit.intro}</div>}
                          {unit.lessons.map((lesson) => (
                            <button key={lesson.id} onClick={() => handleLessonClick(lesson.id)} className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer ${selectedLesson === lesson.id ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                              <div className="text-sm font-medium truncate">{lesson.title}</div>
                              <div className={`text-xs mt-1 truncate ${selectedLesson === lesson.id ? 'text-blue-100' : 'text-gray-500'}`}>{lesson.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <div className="lg:hidden">
            <div className={`w-[280px] bg-white shadow-lg border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">Course Content</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <nav className="p-4">
                  {courseData.units.map((unit) => (
                    <div key={unit.id} className="mb-2">
                      <button onClick={() => toggleUnit(unit.id)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between">
                        <span className="font-medium text-gray-700">{unit.title}</span>
                        <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedUnits.includes(unit.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedUnits.includes(unit.id) && (
                        <div className="ml-4 mt-2 space-y-1">
                          {unit.intro && <div className="p-2 text-xs text-gray-600 bg-gray-50 rounded mb-2">{unit.intro}</div>}
                          {unit.lessons.map((lesson) => (
                            <button key={lesson.id} onClick={() => handleLessonClick(lesson.id)} className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer ${selectedLesson === lesson.id ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                              <div className="text-sm font-medium truncate">{lesson.title}</div>
                              <div className={`text-xs mt-1 truncate ${selectedLesson === lesson.id ? 'text-blue-100' : 'text-gray-500'}`}>{lesson.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div id="course-content" className="flex flex-col lg:ml-0">
            <div className="bg-white border-b border-gray-200 p-6">
              {selectedLesson ? (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{courseData.units.flatMap((u) => u.lessons).find((l) => l.id === selectedLesson)?.title}</h1>
                  <p className="text-lg text-gray-600 mb-6">{courseData.units.flatMap((u) => u.lessons).find((l) => l.id === selectedLesson)?.description}</p>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253" />
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
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Welcome to {courseShort ?? courseData.title.split(':')[0]}</h2>
                  <p className="text-gray-600 mt-2">Choose a lesson from the sidebar to get started</p>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 sm:p-6">
              {selectedLesson ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Key Concepts
                    </h2>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-3">•</span>
                        <span className="text-gray-800 leading-relaxed">{getLessonContent(selectedLesson)}</span>
                      </li>
                      {getLessonEquations(selectedLesson).map((eq, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-600 mr-3">•</span>
                          <span className="text-gray-800 leading-relaxed"><BlockMath math={eq} /></span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Practice</h2>
                    <p className="text-sm font-medium text-gray-600 mb-2">Think about it</p>
                    <ol className="space-y-3 list-decimal list-inside text-gray-700">
                      <li>Paraphrase the core idea of this lesson in your own words.</li>
                      <li>Create a small example that demonstrates the concept.</li>
                      <li>Explain one common misconception and why it’s incorrect.</li>
                    </ol>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Understanding</h2>
                    <Quiz questions={[]} />
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Up next for you:</p>
                        <h2 className="text-2xl font-bold text-gray-900">{courseData.units[0]?.title}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About this unit</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span><span className="leading-relaxed">{courseData.units[0]?.intro}</span></li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span><span className="leading-relaxed">Work with field intuition, flux, and symmetry.</span></li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span><span className="leading-relaxed">Connect physical laws to problem-solving strategies.</span></li>
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Topics in this unit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courseData.units[0]?.lessons.map((lesson, index) => (
                        <button key={lesson.id} onClick={() => handleLessonClick(lesson.id)} className="text-left p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group bg-white cursor-pointer">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">{index + 1}</div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 flex-1 leading-tight">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 ml-11 leading-relaxed">{lesson.description}</p>
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

                  <div className="mb-8">
                    <button onClick={() => courseData.units[0]?.lessons[0] && handleLessonClick(courseData.units[0].lessons[0].id)} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                      Get started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
