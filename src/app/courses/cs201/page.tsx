'use client';

import { useState } from 'react';
import Link from 'next/link';

// Static data for CS201 course based on Duke schedule
const courseData = {
  title: "CS201: Data Structures and Algorithms",
  units: [
    {
      id: "unit1",
      title: "Unit 1: Introduction",
      lessons: [
        { id: "overview", title: "Course Overview", description: "Introduction to the course and expectations" },
        { id: "java-review", title: "Java Review", description: "Review of Java fundamentals" },
        { id: "object-oriented", title: "Object-Oriented Programming", description: "Classes, objects, and inheritance" }
      ]
    },
    {
      id: "unit2", 
      title: "Unit 2: Arrays and ArrayLists",
      lessons: [
        { id: "array-basics", title: "Array Basics", description: "Introduction to arrays and indexing" },
        { id: "arraylist-practice", title: "ArrayList Practice", description: "Working with dynamic arrays" },
        { id: "array-algorithms", title: "Array Algorithms", description: "Searching and sorting algorithms" }
      ]
    },
    {
      id: "unit3",
      title: "Unit 3: Linked Lists",
      lessons: [
        { id: "linked-list-intro", title: "Introduction to Linked Lists", description: "Understanding node-based data structures" },
        { id: "linked-list-operations", title: "Linked List Operations", description: "Insertion, deletion, and traversal" },
        { id: "doubly-linked", title: "Doubly Linked Lists", description: "Bidirectional traversal and operations" }
      ]
    },
    {
      id: "unit4",
      title: "Unit 4: Stacks and Queues",
      lessons: [
        { id: "stack-implementation", title: "Stack Implementation", description: "LIFO data structure implementation" },
        { id: "queue-implementation", title: "Queue Implementation", description: "FIFO data structure implementation" },
        { id: "stack-queue-applications", title: "Applications", description: "Real-world uses of stacks and queues" }
      ]
    },
    {
      id: "unit5",
      title: "Unit 5: Trees",
      lessons: [
        { id: "tree-basics", title: "Tree Basics", description: "Introduction to tree data structures" },
        { id: "binary-trees", title: "Binary Trees", description: "Binary tree properties and operations" },
        { id: "tree-traversal", title: "Tree Traversal", description: "Preorder, inorder, and postorder traversal" }
      ]
    },
    {
      id: "unit6",
      title: "Unit 6: Hash Tables",
      lessons: [
        { id: "hash-functions", title: "Hash Functions", description: "Understanding hash functions and collision handling" },
        { id: "hash-table-implementation", title: "Hash Table Implementation", description: "Building efficient hash tables" },
        { id: "hash-applications", title: "Hash Table Applications", description: "Real-world applications of hash tables" }
      ]
    }
  ]
};

export default function CS201Course() {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(['unit1']);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleLessonClick = (lessonId: string) => {
    setSelectedLesson(lessonId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Courses
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">CS201: Data Structures and Algorithms</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, Student
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              Course Content
            </h2>
          </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            {courseData.units.map((unit) => (
              <div key={unit.id} className="mb-2">
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">{unit.title}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedUnits.includes(unit.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedUnits.includes(unit.id) && (
                  <div className="ml-4 mt-2 space-y-1">
                    {unit.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 border-l-2 ${
                          selectedLesson === lesson.id 
                            ? 'bg-blue-50 border-blue-500 text-blue-900' 
                            : 'hover:bg-blue-50 border-transparent hover:border-blue-500 text-gray-900'
                        }`}
                      >
                        <div className="text-sm font-medium">{lesson.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{lesson.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {selectedLesson 
              ? courseData.units
                  .flatMap(unit => unit.lessons)
                  .find(lesson => lesson.id === selectedLesson)?.title || 'Select a Lesson'
              : 'Welcome to CS201'
            }
          </h2>
          <p className="text-gray-600 mt-2">
            {selectedLesson 
              ? courseData.units
                  .flatMap(unit => unit.lessons)
                  .find(lesson => lesson.id === selectedLesson)?.description || ''
              : 'Choose a lesson from the sidebar to get started'
            }
          </p>
        </div>

        <div className="flex-1 p-6">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Lesson Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {courseData.units
                    .flatMap(unit => unit.lessons)
                    .find(lesson => lesson.id === selectedLesson)?.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {courseData.units
                    .flatMap(unit => unit.lessons)
                    .find(lesson => lesson.id === selectedLesson)?.description}
                </p>
                
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Lesson Content</h4>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {selectedLesson === 'overview' && 'This lesson provides an overview of the CS201 course, including learning objectives, course structure, and expectations for students.'}
                    {selectedLesson === 'java-review' && 'A comprehensive review of Java programming fundamentals including syntax, data types, control structures, and basic object-oriented concepts.'}
                    {selectedLesson === 'object-oriented' && 'Deep dive into object-oriented programming concepts including classes, objects, inheritance, polymorphism, and encapsulation in Java.'}
                    {selectedLesson === 'array-basics' && 'Understanding arrays as fundamental data structures, including declaration, initialization, indexing, and basic operations.'}
                    {selectedLesson === 'arraylist-practice' && 'Hands-on practice with ArrayList, understanding dynamic arrays, and common operations like add, remove, and search.'}
                    {selectedLesson === 'array-algorithms' && 'Implementation and analysis of fundamental array algorithms including linear search, binary search, bubble sort, and selection sort.'}
                    {selectedLesson === 'linked-list-intro' && 'Introduction to linked lists as dynamic data structures, understanding nodes, pointers, and basic linked list concepts.'}
                    {selectedLesson === 'linked-list-operations' && 'Implementation of core linked list operations including insertion at various positions, deletion, and traversal algorithms.'}
                    {selectedLesson === 'doubly-linked' && 'Understanding and implementing doubly linked lists with bidirectional traversal capabilities and their advantages.'}
                    {selectedLesson === 'stack-implementation' && 'Implementation of stack data structure using arrays and linked lists, understanding LIFO (Last In, First Out) principle.'}
                    {selectedLesson === 'queue-implementation' && 'Implementation of queue data structure, understanding FIFO (First In, First Out) principle and various queue implementations.'}
                    {selectedLesson === 'stack-queue-applications' && 'Exploring real-world applications of stacks and queues including expression evaluation, function calls, and scheduling algorithms.'}
                    {selectedLesson === 'tree-basics' && 'Introduction to tree data structures, understanding nodes, edges, root, leaves, and basic tree terminology.'}
                    {selectedLesson === 'binary-trees' && 'Understanding binary trees, their properties, and basic operations including insertion, deletion, and search.'}
                    {selectedLesson === 'tree-traversal' && 'Implementation and understanding of different tree traversal algorithms: preorder, inorder, and postorder traversal.'}
                    {selectedLesson === 'hash-functions' && 'Understanding hash functions, their properties, and various collision resolution techniques including chaining and open addressing.'}
                    {selectedLesson === 'hash-table-implementation' && 'Implementation of hash tables with different collision resolution strategies and analysis of time complexity.'}
                    {selectedLesson === 'hash-applications' && 'Exploring real-world applications of hash tables including databases, caches, and symbol tables.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Understand the fundamental concepts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Implement practical examples</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Analyze time and space complexity</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Resources Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Lecture Notes</h4>
                        <p className="text-sm text-gray-500">PDF slides and materials</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Code Examples</h4>
                        <p className="text-sm text-gray-500">Java source code files</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Practice Problems</h4>
                        <p className="text-sm text-gray-500">Exercises and solutions</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Video Lectures</h4>
                        <p className="text-sm text-gray-500">Recorded class sessions</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Assignments</h4>
                        <p className="text-sm text-gray-500">Homework and projects</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Quizzes</h4>
                        <p className="text-sm text-gray-500">Knowledge assessments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to CS201</h3>
              <p className="text-gray-600 mb-6">
                Select a lesson from the sidebar to view course materials and resources.
              </p>
              <div className="text-sm text-gray-500">
                This course covers fundamental data structures and algorithms using Java.
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
