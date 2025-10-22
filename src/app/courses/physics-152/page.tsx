'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BlockMath } from 'react-katex';
import Quiz from '@/components/study/Quiz';

// Static data for Physics 152 course
const courseData = {
  title: "Physics 152: Electricity and Magnetism",
  units: [
    {
      id: "unit1",
      title: "Unit 1: Electrostatics Foundations",
      intro: "Point charge interactions, superposition, field as a vector field; quick vector-calculus refresher.",
      lessons: [
        { id: "coulombs-law", title: "Coulomb's Law & Superposition", description: "Force and field from point charges; superposition principle." },
        { id: "electric-field-lines", title: "Electric Field Lines & Flux", description: "Flux through surfaces; symmetry intuition." },
        { id: "multivariable-tools", title: "Multivariable Tools", description: "Gradient, line/surface/volume integrals; notation." }
      ]
    },
    {
      id: "unit2", 
      title: "Unit 2: Gauss's Law",
      intro: "Use symmetry to get E from enclosed charge.",
      lessons: [
        { id: "integral-form", title: "Integral Form", description: "Gauss's law in integral form and applications." },
        { id: "symmetric-distributions", title: "Symmetric Charge Distributions", description: "Sphere, infinite plane, cylinder examples." },
        { id: "conductors-dipoles", title: "Conductors & Dipoles", description: "Fields inside conductors, surface charge, dipole fields." }
      ]
    },
    {
      id: "unit3",
      title: "Unit 3: Potential & Energy",
      intro: "Scalar potential simplifies electrostatics; energy in fields.",
      lessons: [
        { id: "potential-relation", title: "Potential V and relation to E", description: "E = -∇V, ΔV = -∫E·dl relationship." },
        { id: "potential-energy", title: "Potential Energy & Work", description: "U = qV, configurations of multiple charges." },
        { id: "capacitors", title: "Capacitors", description: "C = ε₀A/d, dielectric effects, energy storage." }
      ]
    },
    {
      id: "unit4",
      title: "Unit 4: Differential Operators",
      intro: "Field interpretation and identities used across E&M.",
      lessons: [
        { id: "gradient-level-sets", title: "Gradient & Level Sets", description: "Understanding gradient and equipotential surfaces." },
        { id: "divergence-gauss", title: "Divergence & Gauss's Theorem", description: "∇·E = ρ/ε₀, Gauss's divergence theorem." },
        { id: "curl-stokes", title: "Curl & Stokes", description: "Preview for magnetism and induction applications." }
      ]
    },
    {
      id: "unit5",
      title: "Unit 5: Circuits I (Capacitors & RC)",
      intro: "Lumped-element models for transient behavior.",
      lessons: [
        { id: "capacitor-circuits", title: "Capacitor Circuits", description: "Series/parallel rules and combinations." },
        { id: "rc-transients", title: "RC Transients", description: "Exponential charging and discharging behavior." },
        { id: "time-constants", title: "Time Constants and Measurement", description: "τ = RC, practical circuit analysis." }
      ]
    },
    {
      id: "unit6",
      title: "Unit 6: Magnetostatics",
      intro: "Fields from steady currents.",
      lessons: [
        { id: "lorentz-force", title: "Lorentz Force", description: "F = q(E + v×B), magnetic force on moving charges." },
        { id: "biot-savart", title: "B from Currents", description: "Biot-Savart law and applications." },
        { id: "amperes-law", title: "Ampère's Law & Stokes", description: "∮B·dl = μ₀I_enc, applications to current distributions." }
      ]
    },
    {
      id: "unit7",
      title: "Unit 7: Induction",
      intro: "Changing flux induces EMF; Lenz's law.",
      lessons: [
        { id: "faradays-law", title: "Faraday's Law", description: "E = -dΦ_B/dt, differential form ∇×E = -∂B/∂t." },
        { id: "motional-emf", title: "Motional EMF & Induced Fields", description: "Moving conductors and induced electric fields." },
        { id: "energy-transfer", title: "Energy Transfer & Eddy Currents", description: "Energy conversion and dissipation mechanisms." }
      ]
    },
    {
      id: "unit8",
      title: "Unit 8: Circuits II (Inductance, LR, LC)",
      intro: "Magnetic energy storage; oscillations.",
      lessons: [
        { id: "inductors-energy", title: "Inductors & Energy", description: "U = ½LI², magnetic energy storage." },
        { id: "lr-transients", title: "LR Transients", description: "Exponential current behavior in inductive circuits." },
        { id: "lc-oscillations", title: "LC Oscillations", description: "ω₀ = 1/√LC, resonance and harmonic motion." }
      ]
    },
    {
      id: "unit9",
      title: "Unit 9: Microscopic Theory of Currents",
      intro: "Optional: Drude model and conductivity.",
      lessons: [
        { id: "drude-model", title: "Drude Model & Conductivity", description: "σ, mobility, mean free time concepts." },
        { id: "macroscopic-current", title: "Relation to Macroscopic J = σE", description: "Connection between microscopic and macroscopic views." }
      ]
    },
    {
      id: "unit10",
      title: "Unit 10: Maxwell's Equations & EM Waves",
      intro: "Unification; wave solutions in vacuum.",
      lessons: [
        { id: "maxwell-set", title: "Maxwell Set", description: "Integral and differential forms of Maxwell's equations." },
        { id: "em-waves", title: "EM Wave in Vacuum", description: "c = 1/√(μ₀ε₀), plane-wave relations E⊥B⊥k." },
        { id: "energy-flow", title: "Intro to Energy Flow", description: "Poynting vector S = (1/μ₀)E×B." }
      ]
    },
    {
      id: "assessments",
      title: "Assessments & Labs",
      intro: "Quizzes, homework, midterms, labs, and final exam.",
      lessons: [
        { id: "quizzes-homework", title: "Quizzes/Homework", description: "HW1–HW11; Quiz 1–10" },
        { id: "midterms", title: "Midterms", description: "Midterm 1 (HW1–HW4), Midterm 2 (HW5–HW8)" },
        { id: "labs", title: "Labs", description: "Electrostatics, Electric field mapping, RC circuit, Magnetic force, Induction" },
        { id: "worksheets", title: "Worksheets", description: "Math Worksheet 1–4; Pre/Post-Concept Tests" },
        { id: "final-exam", title: "Final Exam", description: "Comprehensive exam covering entire syllabus" }
      ]
    }
  ]
};

export default function Physics152Course() {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(['unit1']);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchAnswer, setSearchAnswer] = useState('');

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleLessonClick = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setSidebarOpen(false);
  };

  // Common syllabus questions with answers
  const syllabusQuestions = [
    "When is the next test?",
    "What do I do if I have to skip lab?",
    "How do I submit assignments?",
    "What is the grading policy?",
    "When are office hours?",
    "How do I get help with homework?",
    "What textbooks do I need?",
    "How do I access the course materials?",
    "What is the lab schedule?",
    "How are equations formatted in assignments?"
  ];

  const questionAnswers: Record<string, string> = {
    "When is the next test?": "The next test is scheduled for March 20th, 2024. It will cover Units 1-4 (Electrostatics Foundations, Gauss's Law, Potential & Energy, and Differential Operators). The test will be held during regular class time and will be 90 minutes long.",
    "What do I do if I have to skip lab?": "If you need to skip lab, please email your TA at least 24 hours in advance. You can make up the lab during office hours or by completing the lab assignment independently. All lab work must be completed within one week of the original lab date.",
    "How do I submit assignments?": "All assignments should be submitted through the course's online portal. Make sure to show all work clearly and include proper equation formatting using standard mathematical notation. Late submissions will receive a 10% penalty per day, up to 3 days late.",
    "What is the grading policy?": "Your final grade is calculated as follows: 40% exams (2 midterms + final), 25% homework, 20% lab work, 10% quizzes, and 5% participation. You must pass the final exam to pass the course.",
    "When are office hours?": "Office hours are held Tuesday and Thursday from 3:00-5:00 PM in the Physics building, room 301. You can also schedule appointments by emailing the instructor. Virtual office hours are available on Fridays from 2:00-4:00 PM via Zoom.",
    "How do I get help with homework?": "You can get help through office hours, the course discussion forum, or by emailing your TA. The Physics tutoring center is also available Monday-Friday from 10 AM to 6 PM. Remember to start assignments early and show all your work!",
    "What textbooks do I need?": "The required textbook is 'Electricity and Magnetism' by Purcell and Morin (3rd edition). You can purchase it from the campus bookstore or online. The library also has copies available for short-term loan.",
    "How do I access the course materials?": "All course materials are available on the course website. You'll need to log in with your university credentials. Lecture slides, assignments, and additional resources are organized by unit. Make sure to check the announcements regularly for updates.",
    "What is the lab schedule?": "Labs are held every Wednesday from 2:00-5:00 PM in the Physics Lab, room 205. There are 5 labs total: Electrostatics, Electric field mapping, RC circuit, Magnetic force, and Induction. Lab reports are due one week after each lab.",
    "How are equations formatted in assignments?": "Use standard mathematical notation. For inline equations, use single dollar signs $E = -\\nabla V$. For display equations, use double dollar signs $$\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\epsilon_0}$$. Show all work clearly."
  };

  const handleQuestionSelect = (question: string) => {
    setSearchQuery(question);
    setShowDropdown(false);
    setSearchAnswer(questionAnswers[question] || '');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = questionAnswers[searchQuery];
    if (answer) {
      setSearchAnswer(answer);
    } else {
      setSearchAnswer("I don't have a specific answer for that question. Please try one of the common questions from the dropdown, or contact your instructor for more information.");
    }
  };

  // Get lesson content with equations
  const getLessonContent = (lessonId: string) => {
    const contentMap: Record<string, string> = {
      'coulombs-law': 'Force between point charges follows Coulomb\'s law. The electric field from multiple charges uses superposition.',
      'electric-field-lines': 'Electric field lines represent the direction and strength of electric fields. Flux through a surface measures the number of field lines passing through.',
      'multivariable-tools': 'Vector calculus tools including gradient, divergence, and curl are essential for understanding electromagnetic fields.',
      'integral-form': 'Gauss\'s law in integral form relates the electric flux through a closed surface to the enclosed charge.',
      'symmetric-distributions': 'Highly symmetric charge distributions allow us to easily calculate electric fields using Gauss\'s law.',
      'conductors-dipoles': 'Inside conductors, the electric field is zero in electrostatic equilibrium. Electric dipoles create fields that fall off as 1/r³ at large distances.',
      'potential-relation': 'The electric potential V is related to the electric field E through the gradient operation. This scalar potential simplifies many electrostatic problems.',
      'potential-energy': 'Electric potential energy U = qV provides a way to understand the energy stored in charge configurations.',
      'capacitors': 'Capacitors store electrical energy. The capacitance depends on geometry and dielectric materials.',
      'gradient-level-sets': 'The gradient of a scalar field points in the direction of maximum increase and is perpendicular to level sets.',
      'divergence-gauss': 'The divergence of the electric field is proportional to the charge density, as expressed in Gauss\'s law.',
      'curl-stokes': 'The curl operation will be important for understanding magnetic fields and electromagnetic induction.',
      'capacitor-circuits': 'Capacitors in series and parallel follow specific rules for equivalent capacitance.',
      'rc-transients': 'RC circuits exhibit exponential behavior during charging and discharging processes.',
      'time-constants': 'The time constant τ = RC characterizes how quickly RC circuits respond to changes.',
      'lorentz-force': 'The Lorentz force law describes the force on a charged particle moving in electric and magnetic fields.',
      'biot-savart': 'The Biot-Savart law allows calculation of magnetic fields from current distributions.',
      'amperes-law': 'Ampère\'s law relates the circulation of magnetic field to the current passing through the enclosed area.',
      'faradays-law': 'Faraday\'s law describes how changing magnetic flux induces electric fields and EMF.',
      'motional-emf': 'Moving conductors in magnetic fields experience motional EMF due to the Lorentz force.',
      'energy-transfer': 'Electromagnetic induction involves energy transfer between magnetic and electric fields.',
      'inductors-energy': 'Inductors store magnetic energy and oppose changes in current.',
      'lr-transients': 'LR circuits exhibit exponential behavior similar to RC circuits but with different time constants.',
      'lc-oscillations': 'LC circuits can oscillate at their natural frequency, storing energy alternately in electric and magnetic fields.',
      'drude-model': 'The Drude model provides a classical description of electrical conductivity in metals.',
      'macroscopic-current': 'The macroscopic current density J = σE relates to the microscopic motion of charge carriers.',
      'maxwell-set': 'Maxwell\'s equations provide a complete description of classical electromagnetism.',
      'em-waves': 'Electromagnetic waves in vacuum travel at the speed of light and have transverse electric and magnetic fields.',
      'energy-flow': 'The Poynting vector describes the flow of electromagnetic energy.',
      'quizzes-homework': 'Regular homework assignments and quizzes help reinforce concepts throughout the semester.',
      'midterms': 'Two midterm exams test understanding of major course topics at intermediate points.',
      'labs': 'Hands-on laboratory experiments provide practical experience with electromagnetic phenomena.',
      'worksheets': 'Mathematical worksheets and concept tests help develop problem-solving skills.',
      'final-exam': 'The comprehensive final exam covers all course material and determines final grades.'
    };
    return contentMap[lessonId] || 'Content for this lesson will be available soon.';
  };

  // Get equations for specific lessons
  const getLessonEquations = (lessonId: string) => {
    const equationMap: Record<string, string[]> = {
      'coulombs-law': [
        '\\mathbf{F}_{12} = k\\frac{q_1 q_2}{r^2}\\hat{\\mathbf{r}}',
        '\\mathbf{E}(\\mathbf{r}) = \\sum_i k\\frac{q_i}{r_i^2}\\hat{\\mathbf{r}}_i'
      ],
      'integral-form': [
        '\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\epsilon_0}'
      ],
      'potential-relation': [
        '\\mathbf{E} = -\\nabla V',
        '\\Delta V = -\\int \\mathbf{E} \\cdot d\\mathbf{l}'
      ],
      'potential-energy': [
        'U = qV'
      ],
      'capacitors': [
        'C = \\frac{\\epsilon_0 A}{d}',
        'U = \\frac{1}{2}CV^2'
      ],
      'divergence-gauss': [
        '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}'
      ],
      'rc-transients': [
        'V_C(t) = V_0(1 - e^{-t/RC})',
        'I(t) = \\frac{V_0}{R}e^{-t/RC}'
      ],
      'lorentz-force': [
        '\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B})'
      ],
      'amperes-law': [
        '\\oint \\mathbf{B} \\cdot d\\mathbf{l} = \\mu_0 I_{\\text{enc}}'
      ],
      'faradays-law': [
        '\\mathcal{E} = -\\frac{d\\Phi_B}{dt}',
        '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}'
      ],
      'inductors-energy': [
        'U = \\frac{1}{2}LI^2'
      ],
      'lc-oscillations': [
        '\\omega_0 = \\frac{1}{\\sqrt{LC}}'
      ],
      'em-waves': [
        'c = \\frac{1}{\\sqrt{\\mu_0\\epsilon_0}}'
      ],
      'energy-flow': [
        '\\mathbf{S} = \\frac{1}{\\mu_0}\\mathbf{E} \\times \\mathbf{B}'
      ]
    };
    return equationMap[lessonId] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Courses</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                <span className="hidden sm:inline">Physics 152: Electricity and Magnetism</span>
                <span className="sm:hidden">Physics 152</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:block text-sm text-gray-600">
                Welcome back, Student
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`
          w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
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
                    {/* Show unit intro if available */}
                    {unit.intro && (
                      <div className="p-2 text-xs text-gray-600 bg-gray-50 rounded mb-2">
                        {unit.intro}
                      </div>
                    )}
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
        <div id="course-content" className="flex-1 flex flex-col lg:ml-0">
          {/* Title + actions (CS201 style) */}
          <div className="bg-white border-b border-gray-200 p-6">
            {selectedLesson ? (
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {courseData.units.flatMap(u => u.lessons).find(l => l.id === selectedLesson)?.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  {courseData.units.flatMap(u => u.lessons).find(l => l.id === selectedLesson)?.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                    <span className="font-medium text-sm">Generate Quiz</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    <span className="font-medium text-sm">Make Flashcards</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span className="font-medium text-sm">Take Notes</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    <span className="font-medium text-sm">Study Guide</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-md hover:shadow-lg cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span className="font-medium text-sm">Ask AI</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Welcome to Physics 152</h2>
                <p className="text-gray-600 mt-2">Choose a lesson from the sidebar to get started</p>
              </div>
            )}
          </div>

          {/* Removed small title bar to match CS201 header block above */}

          <div className="flex-1 p-4 sm:p-6">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Key Concepts (CS201 style) */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Key Concepts
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start"><span className="text-blue-600 mr-3">•</span><span className="text-gray-800 leading-relaxed">{getLessonContent(selectedLesson)}</span></li>
                  {getLessonEquations(selectedLesson).map((eq, i) => (
                    <li key={i} className="flex items-start"><span className="text-blue-600 mr-3">•</span><span className="text-gray-800 leading-relaxed"><BlockMath math={eq} /></span></li>
                  ))}
                </ul>
              </div>

              {/* Practice (CS201 style) */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Practice</h2>
                <p className="text-sm font-medium text-gray-600 mb-2">Think about it</p>
                <ol className="space-y-3 list-decimal list-inside text-gray-700">
                  <li>Paraphrase the core idea of this lesson in your own words.</li>
                  <li>Create a small example that demonstrates the concept.</li>
                  <li>Explain one common misconception and why it’s incorrect.</li>
                </ol>
              </div>

              {/* Check Your Understanding */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Understanding</h2>
                <Quiz questions={[]} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Welcome to Physics 152</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Select a lesson from the sidebar to view course materials and resources.
              </p>
              <div className="text-xs sm:text-sm text-gray-500">
                This course covers electricity and magnetism with mathematical rigor and practical applications.
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
