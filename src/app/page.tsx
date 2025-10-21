import Link from 'next/link';

export default function Home() {
  // Mock data for dashboard components
  const upcomingAssignments = [
    {
      id: 'hw3-physics',
      courseId: 'physics-152',
      courseTitle: 'Physics 152',
      assignmentName: 'HW3: Gauss\'s Law',
      type: 'Homework',
      dueDate: '2024-03-18',
      dueTime: '11:59 PM',
      courseRoute: '/courses/physics-152',
      priority: 'high'
    },
    {
      id: 'quiz2-cs201',
      courseId: 'cs201',
      courseTitle: 'CS201',
      assignmentName: 'Quiz 2: Linked Lists',
      type: 'Quiz',
      dueDate: '2024-03-20',
      dueTime: '2:00 PM',
      courseRoute: '/courses/cs201',
      priority: 'medium'
    },
    {
      id: 'lab3-physics',
      courseId: 'physics-152',
      courseTitle: 'Physics 152',
      assignmentName: 'Lab 3: RC Circuit',
      type: 'Lab',
      dueDate: '2024-03-22',
      dueTime: '5:00 PM',
      courseRoute: '/courses/physics-152',
      priority: 'medium'
    },
    {
      id: 'hw4-cs101',
      courseId: 'cs101',
      courseTitle: 'CS101',
      assignmentName: 'HW4: Functions and Loops',
      type: 'Homework',
      dueDate: '2024-03-25',
      dueTime: '11:59 PM',
      courseRoute: '#',
      priority: 'low'
    }
  ];

  const suggestedModules = [
    {
      id: 'gauss-law-physics',
      courseId: 'physics-152',
      courseTitle: 'Physics 152',
      moduleTitle: 'Gauss\'s Law',
      reason: 'Linked to HW3 due soon',
      courseRoute: '/courses/physics-152',
      lastViewed: '2024-03-15'
    },
    {
      id: 'linked-lists-cs201',
      courseId: 'cs201',
      courseTitle: 'CS201',
      moduleTitle: 'Linked List Operations',
      reason: 'Quiz 2 preparation',
      courseRoute: '/courses/cs201',
      lastViewed: '2024-03-14'
    },
    {
      id: 'rc-circuits-physics',
      courseId: 'physics-152',
      courseTitle: 'Physics 152',
      moduleTitle: 'RC Transients',
      reason: 'Lab 3 prerequisite',
      courseRoute: '/courses/physics-152',
      lastViewed: null
    },
    {
      id: 'object-oriented-cs201',
      courseId: 'cs201',
      courseTitle: 'CS201',
      moduleTitle: 'Object-Oriented Programming',
      reason: 'Recently updated content',
      courseRoute: '/courses/cs201',
      lastViewed: '2024-03-12'
    }
  ];

  const announcements = [
    {
      id: 'ann1',
      courseId: 'physics-152',
      courseTitle: 'Physics 152',
      title: 'Office Hours Change',
      content: 'Dr. Chen\'s office hours moved to Tuesday 3-5 PM this week only.',
      timestamp: '2024-03-16T10:30:00Z'
    },
    {
      id: 'ann2',
      courseId: 'cs201',
      courseTitle: 'CS201',
      title: 'Quiz 2 Study Guide Posted',
      content: 'Study guide for Quiz 2 is now available in the course materials.',
      timestamp: '2024-03-16T09:15:00Z'
    }
  ];
  const courses = [
    {
      id: 'cs201',
      title: 'CS201: Data Structures and Algorithms',
      description: 'Learn fundamental data structures and algorithms using Java. Covers arrays, linked lists, stacks, queues, trees, and hash tables.',
      instructor: 'Dr. Owen Astrachan',
      progress: 0,
      totalLessons: 18,
      completedLessons: 0,
      color: 'blue',
      difficulty: 'Intermediate',
      duration: '12 weeks'
    },
    {
      id: 'physics-152',
      title: 'Physics 152: Electricity and Magnetism',
      description: 'Vector fields, Gauss\'s law, circuits, induction, Maxwell, waves',
      instructor: 'Dr. Sarah Chen',
      progress: 0,
      totalLessons: 35,
      completedLessons: 0,
      color: 'blue',
      difficulty: 'Intermediate',
      duration: '14 weeks'
    },
    {
      id: 'cs101',
      title: 'CS101: Introduction to Programming',
      description: 'Introduction to computer science and programming fundamentals using Python.',
      instructor: 'Prof. Jane Smith',
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      color: 'blue',
      difficulty: 'Beginner',
      duration: '8 weeks'
    },
    {
      id: 'cs301',
      title: 'CS301: Software Engineering',
      description: 'Software development methodologies, design patterns, and project management.',
      instructor: 'Dr. Michael Johnson',
      progress: 25,
      totalLessons: 16,
      completedLessons: 4,
      color: 'blue',
      difficulty: 'Advanced',
      duration: '10 weeks'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500 hover:bg-blue-600 border-blue-200',
      green: 'bg-green-500 hover:bg-green-600 border-green-200',
      purple: 'bg-purple-500 hover:bg-purple-600 border-purple-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getDifficultyColor = (difficulty: string) => {
    const difficultyMap = {
      'Beginner': 'text-green-600 bg-green-100',
      'Intermediate': 'text-blue-600 bg-blue-100',
      'Advanced': 'text-red-600 bg-red-100'
    };
    return difficultyMap[difficulty as keyof typeof difficultyMap] || difficultyMap.Intermediate;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Kaizen</h1>
              <span className="ml-2 text-sm text-gray-500">Learning Platform</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Your personalized learning overview</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Assignments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-3">
              {upcomingAssignments.slice(0, 4).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={assignment.courseRoute}
                  className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          assignment.type === 'Homework' ? 'bg-blue-100 text-blue-800' :
                          assignment.type === 'Quiz' ? 'bg-green-100 text-green-800' :
                          assignment.type === 'Lab' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {assignment.type}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          assignment.priority === 'high' ? 'bg-red-500' :
                          assignment.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{assignment.assignmentName}</h4>
                      <p className="text-xs text-gray-500">{assignment.courseTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{assignment.dueDate}</p>
                      <p className="text-xs text-gray-400">{assignment.dueTime}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {upcomingAssignments.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">No upcoming assignments — you&apos;re caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Modules */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Suggested Learning</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-3">
              {suggestedModules.slice(0, 4).map((module) => (
                <Link
                  key={module.id}
                  href={module.courseRoute}
                  className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{module.moduleTitle}</h4>
                      <p className="text-xs text-gray-500 mb-1">{module.courseTitle}</p>
                      <p className="text-xs text-blue-600">{module.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {module.lastViewed && (
                        <span className="text-xs text-gray-400">
                          Viewed {new Date(module.lastViewed).toLocaleDateString()}
                        </span>
                      )}
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Calendar Snapshot */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              {upcomingAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className={`w-3 h-3 rounded-full ${
                    assignment.priority === 'high' ? 'bg-red-500' :
                    assignment.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{assignment.assignmentName}</p>
                    <p className="text-xs text-gray-500">{assignment.dueDate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assignment.type === 'Homework' ? 'bg-blue-100 text-blue-800' :
                    assignment.type === 'Quiz' ? 'bg-green-100 text-green-800' :
                    assignment.type === 'Lab' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {assignment.type}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">View full calendar for more details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={course.id === 'cs201' ? '/courses/cs201' : course.id === 'physics-152' ? '/courses/physics-152' : '#'}
                className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{course.title.split(':')[0]}</h4>
                  <span className="text-xs text-gray-500">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      course.color === 'blue' ? 'bg-blue-500' : 
                      course.color === 'green' ? 'bg-green-500' : 
                      'bg-purple-500'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {course.completedLessons} of {course.totalLessons} lessons
                </p>
                <button className={`mt-2 w-full py-1 px-3 text-xs font-medium rounded-lg text-white transition-colors duration-200 ${
                  course.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                  course.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-purple-500 hover:bg-purple-600'
                }`}>
                  {course.progress === 0 ? 'Start Course' : 'Continue'}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 7H6l5-5v5z" />
            </svg>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{announcement.title}</h4>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {announcement.courseTitle}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{announcement.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(announcement.timestamp).toLocaleDateString()} at{' '}
                      {new Date(announcement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h2>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                <p className="text-2xl font-semibold text-gray-900">22</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-semibold text-gray-900">7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={course.id === 'cs201' ? '/courses/cs201' : course.id === 'physics-152' ? '/courses/physics-152' : '#'}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Course Header */}
                <div className={`h-2 ${course.color === 'blue' ? 'bg-blue-500' : course.color === 'green' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                
                <div className="p-6">
                  {/* Course Title and Difficulty */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Instructor */}
                  <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${course.color === 'blue' ? 'bg-blue-500' : course.color === 'green' ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.completedLessons} of {course.totalLessons} lessons completed
                    </p>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.duration}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {course.totalLessons} lessons
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className={`w-full py-2 px-4 rounded-lg text-white text-center font-medium transition-colors duration-200 ${getColorClasses(course.color)}`}>
                    {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Browse Courses</div>
                <div className="text-sm text-gray-500">Discover new courses</div>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">View Progress</div>
                <div className="text-sm text-gray-500">Track your learning</div>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Get Help</div>
                <div className="text-sm text-gray-500">Support and resources</div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
