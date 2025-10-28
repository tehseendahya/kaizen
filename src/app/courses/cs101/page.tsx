'use client';

import Link from 'next/link';

const courseData = {
  title: 'CS101: Introduction to Programming',
  units: [
    {
      id: 'unit1',
      title: 'Unit 1: Getting Started',
      intro: 'Python basics, variables, types, and simple I/O.',
      lessons: [
        { id: 'hello-world', title: 'Hello, World', description: 'Your first Python program and the REPL.' },
        { id: 'variables-types', title: 'Variables and Types', description: 'Numbers, strings, booleans; dynamic typing.' },
        { id: 'input-output', title: 'Input and Output', description: 'Reading user input and printing results.' },
      ],
    },
    {
      id: 'unit2',
      title: 'Unit 2: Control Flow',
      intro: 'Conditionals and loops for basic algorithms.',
      lessons: [
        { id: 'conditionals', title: 'If/Elif/Else', description: 'Branching logic and comparisons.' },
        { id: 'loops', title: 'Loops', description: 'For and while loops; iteration patterns.' },
        { id: 'practice-problems', title: 'Practice Problems', description: 'Small problems to reinforce flow control.' },
      ],
    },
    {
      id: 'unit3',
      title: 'Unit 3: Functions and Data',
      intro: 'Functions, lists, and dictionaries.',
      lessons: [
        { id: 'functions', title: 'Functions', description: 'Defining, returning, and parameters.' },
        { id: 'lists', title: 'Lists', description: 'Indexing, slicing, and common methods.' },
        { id: 'dictionaries', title: 'Dictionaries', description: 'Key/value pairs and lookups.' },
      ],
    },
  ],
};

export default function CS101Course() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">{courseData.title}</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Units</h2>
          <p className="text-gray-600">Start with Unit 1 and work your way down.</p>
        </div>

        <div className="space-y-8">
          {courseData.units.map((unit) => (
            <div key={unit.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{unit.title}</h3>
              <p className="text-gray-600 mb-4">{unit.intro}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/courses/cs101/${lesson.id}`}
                    className="block p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition bg-white"
                  >
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                    <span className="mt-3 inline-flex items-center text-blue-600 text-sm">
                      Start lesson
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

