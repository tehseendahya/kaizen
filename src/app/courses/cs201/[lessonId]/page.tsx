import Link from 'next/link';

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

// Static lesson data mapping
const lessonData: Record<string, { title: string; description: string; content: string }> = {
  'overview': {
    title: 'Course Overview',
    description: 'Introduction to the course and expectations',
    content: 'This lesson provides an overview of the CS201 course, including learning objectives, course structure, and expectations for students.'
  },
  'java-review': {
    title: 'Java Review',
    description: 'Review of Java fundamentals',
    content: 'A comprehensive review of Java programming fundamentals including syntax, data types, control structures, and basic object-oriented concepts.'
  },
  'object-oriented': {
    title: 'Object-Oriented Programming',
    description: 'Classes, objects, and inheritance',
    content: 'Deep dive into object-oriented programming concepts including classes, objects, inheritance, polymorphism, and encapsulation in Java.'
  },
  'array-basics': {
    title: 'Array Basics',
    description: 'Introduction to arrays and indexing',
    content: 'Understanding arrays as fundamental data structures, including declaration, initialization, indexing, and basic operations.'
  },
  'arraylist-practice': {
    title: 'ArrayList Practice',
    description: 'Working with dynamic arrays',
    content: 'Hands-on practice with ArrayList, understanding dynamic arrays, and common operations like add, remove, and search.'
  },
  'array-algorithms': {
    title: 'Array Algorithms',
    description: 'Searching and sorting algorithms',
    content: 'Implementation and analysis of fundamental array algorithms including linear search, binary search, bubble sort, and selection sort.'
  },
  'linked-list-intro': {
    title: 'Introduction to Linked Lists',
    description: 'Understanding node-based data structures',
    content: 'Introduction to linked lists as dynamic data structures, understanding nodes, pointers, and basic linked list concepts.'
  },
  'linked-list-operations': {
    title: 'Linked List Operations',
    description: 'Insertion, deletion, and traversal',
    content: 'Implementation of core linked list operations including insertion at various positions, deletion, and traversal algorithms.'
  },
  'doubly-linked': {
    title: 'Doubly Linked Lists',
    description: 'Bidirectional traversal and operations',
    content: 'Understanding and implementing doubly linked lists with bidirectional traversal capabilities and their advantages.'
  },
  'stack-implementation': {
    title: 'Stack Implementation',
    description: 'LIFO data structure implementation',
    content: 'Implementation of stack data structure using arrays and linked lists, understanding LIFO (Last In, First Out) principle.'
  },
  'queue-implementation': {
    title: 'Queue Implementation',
    description: 'FIFO data structure implementation',
    content: 'Implementation of queue data structure, understanding FIFO (First In, First Out) principle and various queue implementations.'
  },
  'stack-queue-applications': {
    title: 'Applications',
    description: 'Real-world uses of stacks and queues',
    content: 'Exploring real-world applications of stacks and queues including expression evaluation, function calls, and scheduling algorithms.'
  },
  'tree-basics': {
    title: 'Tree Basics',
    description: 'Introduction to tree data structures',
    content: 'Introduction to tree data structures, understanding nodes, edges, root, leaves, and basic tree terminology.'
  },
  'binary-trees': {
    title: 'Binary Trees',
    description: 'Binary tree properties and operations',
    content: 'Understanding binary trees, their properties, and basic operations including insertion, deletion, and search.'
  },
  'tree-traversal': {
    title: 'Tree Traversal',
    description: 'Preorder, inorder, and postorder traversal',
    content: 'Implementation and understanding of different tree traversal algorithms: preorder, inorder, and postorder traversal.'
  },
  'hash-functions': {
    title: 'Hash Functions',
    description: 'Understanding hash functions and collision handling',
    content: 'Understanding hash functions, their properties, and various collision resolution techniques including chaining and open addressing.'
  },
  'hash-table-implementation': {
    title: 'Hash Table Implementation',
    description: 'Building efficient hash tables',
    content: 'Implementation of hash tables with different collision resolution strategies and analysis of time complexity.'
  },
  'hash-applications': {
    title: 'Hash Table Applications',
    description: 'Real-world applications of hash tables',
    content: 'Exploring real-world applications of hash tables including databases, caches, and symbol tables.'
  }
};

export default async function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = await params;
  const lesson = lessonData[resolvedParams.lessonId];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">The requested lesson could not be found.</p>
          <Link 
            href="/courses/cs201"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses/cs201"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Course
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">CS201: Data Structures and Algorithms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{lesson.title}</h2>
              <p className="text-gray-600 mb-6">{lesson.description}</p>
              
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lesson Content</h3>
                <p className="text-gray-700 leading-relaxed">{lesson.content}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Lecture Slides</div>
                    <div className="text-sm text-gray-500">PDF presentation</div>
                  </div>
                </a>

                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Code Examples</div>
                    <div className="text-sm text-gray-500">Java source files</div>
                  </div>
                </a>

                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Practice Exercises</div>
                    <div className="text-sm text-gray-500">Hands-on problems</div>
                  </div>
                </a>

                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Video Lecture</div>
                    <div className="text-sm text-gray-500">Recorded session</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lesson Completion</span>
                  <span className="text-sm font-medium text-gray-900">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500">Complete the lesson activities to track your progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
