import Link from 'next/link';

interface LessonPageProps {
  params: { lessonId: string };
}

const lessonData: Record<string, { title: string; description: string; content: string }> = {
  'hello-world': {
    title: 'Hello, World',
    description: 'Your first Python program and the REPL.',
    content:
      'Print a greeting using print("Hello, World"). Explore the REPL to evaluate expressions quickly.',
  },
  'variables-types': {
    title: 'Variables and Types',
    description: 'Numbers, strings, booleans; dynamic typing.',
    content:
      'Assign variables like x = 42 or name = "Ada". Python infers types dynamically based on values.',
  },
  'input-output': {
    title: 'Input and Output',
    description: 'Reading user input and printing results.',
    content:
      'Use input() to read a line from the user and print() to display results. Cast to int() when needed.',
  },
  conditionals: {
    title: 'If/Elif/Else',
    description: 'Branching logic and comparisons.',
    content:
      'Control flow uses if, elif, and else with indentation to define blocks. Use ==, <, >, and logical operators.',
  },
  loops: {
    title: 'Loops',
    description: 'For and while loops; iteration patterns.',
    content:
      'for loops iterate sequences; while loops repeat until a condition changes. Remember to avoid infinite loops.',
  },
  'practice-problems': {
    title: 'Practice Problems',
    description: 'Small problems to reinforce flow control.',
    content:
      'Implement FizzBuzz, compute factorials, and sum ranges to gain fluency with loops and branches.',
  },
  functions: {
    title: 'Functions',
    description: 'Defining, returning, and parameters.',
    content:
      'Define functions with def name(params): and return results. Functions improve reuse and organization.',
  },
  lists: {
    title: 'Lists',
    description: 'Indexing, slicing, and common methods.',
    content:
      'Lists store ordered items. Use indexing a[0], slicing a[1:3], and methods like append, pop, and sort.',
  },
  dictionaries: {
    title: 'Dictionaries',
    description: 'Key/value pairs and lookups.',
    content:
      'Dictionaries map keys to values: user = {"name": "Ada", "age": 28}. Access with user["name"].',
  },
};

export default function CS101Lesson({ params }: LessonPageProps) {
  const lesson = lessonData[params.lessonId];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">The requested lesson could not be found.</p>
          <Link href="/courses/cs101" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/courses/cs101" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Course
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
            </div>
            <span className="text-sm text-gray-500">CS101: Introduction to Programming</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-700 mb-6 leading-relaxed">{lesson.description}</p>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">{lesson.content}</p>
        </div>
      </div>
    </div>
  );
}

