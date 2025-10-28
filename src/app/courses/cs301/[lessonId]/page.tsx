import Link from 'next/link';

interface LessonPageProps {
  params: { lessonId: string };
}

const lessonData: Record<string, { title: string; description: string; content: string }> = {
  'mvc-architecture': {
    title: 'MVC & Layered Architecture',
    description: 'Separating concerns and structuring large apps.',
    content:
      'MVC separates models, views, and controllers. Layered architectures add clear boundaries for domain, application, and infrastructure.',
  },
  'design-patterns': {
    title: 'Design Patterns',
    description: 'Singleton, Factory, Strategy, Observer basics.',
    content:
      'Common patterns provide reusable solutions. Use them judiciously to improve maintainability and flexibility.',
  },
  solid: {
    title: 'SOLID Principles',
    description: 'Guidelines for maintainable OO designs.',
    content:
      'SOLID principles encourage small, focused classes, explicit dependencies, and extensibility without modification.',
  },
  'testing-pyramid': {
    title: 'Testing Pyramid',
    description: 'Unit, integration, end-to-end tests.',
    content:
      'Favor many fast unit tests, fewer integration tests, and very few E2E tests to balance speed and coverage.',
  },
  'mocks-stubs': {
    title: 'Mocks & Stubs',
    description: 'Isolating dependencies for unit tests.',
    content:
      'Mocks validate interactions; stubs provide canned data. Isolation helps create deterministic, fast tests.',
  },
  'ci-basics': {
    title: 'CI Basics',
    description: 'Continuous integration workflows and tooling.',
    content:
      'CI services run tests and checks on every change, enabling quick feedback and safe collaboration.',
  },
  'git-workflows': {
    title: 'Git Workflows',
    description: 'Feature branches, PRs, and rebasing.',
    content:
      'Adopt a clear branching strategy. Use pull requests and reviews to maintain quality and knowledge sharing.',
  },
  'code-reviews': {
    title: 'Code Reviews',
    description: 'Effective reviews and common pitfalls.',
    content:
      'Reviews focus on correctness, readability, and maintainability. Keep diffs small and provide constructive feedback.',
  },
  'agile-scrum': {
    title: 'Agile & Scrum',
    description: 'Backlogs, sprints, ceremonies, and velocity.',
    content:
      'Scrum organizes work into sprints, guided by a product backlog. Regular ceremonies foster transparency and improvement.',
  },
};

export default function CS301Lesson({ params }: LessonPageProps) {
  const lesson = lessonData[params.lessonId];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">The requested lesson could not be found.</p>
          <Link href="/courses/cs301" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
              <Link href="/courses/cs301" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Course
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
            </div>
            <span className="text-sm text-gray-500">CS301: Software Engineering</span>
          </div>
        </div>
      </div>

      {/* Body */}
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

