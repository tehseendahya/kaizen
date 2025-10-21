import Link from 'next/link';
import { BlockMath } from 'react-katex';

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

// Static lesson data mapping for Physics 152
const lessonData: Record<string, { title: string; description: string; content: string; equations?: string[] }> = {
  'coulombs-law': {
    title: "Coulomb's Law & Superposition",
    description: 'Force and field from point charges; superposition principle.',
    content: 'Force between point charges follows Coulomb\'s law. The electric field from multiple charges uses superposition.',
    equations: [
      '\\mathbf{F}_{12} = k\\frac{q_1 q_2}{r^2}\\hat{\\mathbf{r}}',
      '\\mathbf{E}(\\mathbf{r}) = \\sum_i k\\frac{q_i}{r_i^2}\\hat{\\mathbf{r}}_i'
    ]
  },
  'electric-field-lines': {
    title: 'Electric Field Lines & Flux',
    description: 'Flux through surfaces; symmetry intuition.',
    content: 'Electric field lines represent the direction and strength of electric fields. Flux through a surface measures the number of field lines passing through.'
  },
  'multivariable-tools': {
    title: 'Multivariable Tools',
    description: 'Gradient, line/surface/volume integrals; notation.',
    content: 'Vector calculus tools including gradient, divergence, and curl are essential for understanding electromagnetic fields.'
  },
  'integral-form': {
    title: 'Integral Form',
    description: 'Gauss\'s law in integral form and applications.',
    content: 'Gauss\'s law in integral form relates the electric flux through a closed surface to the enclosed charge.',
    equations: ['\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\epsilon_0}']
  },
  'symmetric-distributions': {
    title: 'Symmetric Charge Distributions',
    description: 'Sphere, infinite plane, cylinder examples.',
    content: 'Highly symmetric charge distributions allow us to easily calculate electric fields using Gauss\'s law.'
  },
  'conductors-dipoles': {
    title: 'Conductors & Dipoles',
    description: 'Fields inside conductors, surface charge, dipole fields.',
    content: 'Inside conductors, the electric field is zero in electrostatic equilibrium. Electric dipoles create fields that fall off as 1/r³ at large distances.'
  },
  'potential-relation': {
    title: 'Potential V and relation to E',
    description: 'E = -∇V, ΔV = -∫E·dl relationship.',
    content: 'The electric potential V is related to the electric field E through the gradient operation. This scalar potential simplifies many electrostatic problems.',
    equations: [
      '\\mathbf{E} = -\\nabla V',
      '\\Delta V = -\\int \\mathbf{E} \\cdot d\\mathbf{l}'
    ]
  },
  'potential-energy': {
    title: 'Potential Energy & Work',
    description: 'U = qV, configurations of multiple charges.',
    content: 'Electric potential energy U = qV provides a way to understand the energy stored in charge configurations.',
    equations: ['U = qV']
  },
  'capacitors': {
    title: 'Capacitors',
    description: 'C = ε₀A/d, dielectric effects, energy storage.',
    content: 'Capacitors store electrical energy. The capacitance depends on geometry and dielectric materials.',
    equations: [
      'C = \\frac{\\epsilon_0 A}{d}',
      'U = \\frac{1}{2}CV^2'
    ]
  },
  'gradient-level-sets': {
    title: 'Gradient & Level Sets',
    description: 'Understanding gradient and equipotential surfaces.',
    content: 'The gradient of a scalar field points in the direction of maximum increase and is perpendicular to level sets.'
  },
  'divergence-gauss': {
    title: 'Divergence & Gauss\'s Theorem',
    description: '∇·E = ρ/ε₀, Gauss\'s divergence theorem.',
    content: 'The divergence of the electric field is proportional to the charge density, as expressed in Gauss\'s law.',
    equations: ['\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}']
  },
  'curl-stokes': {
    title: 'Curl & Stokes',
    description: 'Preview for magnetism and induction applications.',
    content: 'The curl operation will be important for understanding magnetic fields and electromagnetic induction.'
  },
  'capacitor-circuits': {
    title: 'Capacitor Circuits',
    description: 'Series/parallel rules and combinations.',
    content: 'Capacitors in series and parallel follow specific rules for equivalent capacitance.'
  },
  'rc-transients': {
    title: 'RC Transients',
    description: 'Exponential charging and discharging behavior.',
    content: 'RC circuits exhibit exponential behavior during charging and discharging processes.',
    equations: [
      'V_C(t) = V_0(1 - e^{-t/RC})',
      'I(t) = \\frac{V_0}{R}e^{-t/RC}'
    ]
  },
  'time-constants': {
    title: 'Time Constants and Measurement',
    description: 'τ = RC, practical circuit analysis.',
    content: 'The time constant τ = RC characterizes how quickly RC circuits respond to changes.'
  },
  'lorentz-force': {
    title: 'Lorentz Force',
    description: 'F = q(E + v×B), magnetic force on moving charges.',
    content: 'The Lorentz force law describes the force on a charged particle moving in electric and magnetic fields.',
    equations: ['\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B})']
  },
  'biot-savart': {
    title: 'B from Currents',
    description: 'Biot-Savart law and applications.',
    content: 'The Biot-Savart law allows calculation of magnetic fields from current distributions.'
  },
  'amperes-law': {
    title: 'Ampère\'s Law & Stokes',
    description: '∮B·dl = μ₀I_enc, applications to current distributions.',
    content: 'Ampère\'s law relates the circulation of magnetic field to the current passing through the enclosed area.',
    equations: ['\\oint \\mathbf{B} \\cdot d\\mathbf{l} = \\mu_0 I_{\\text{enc}}']
  },
  'faradays-law': {
    title: 'Faraday\'s Law',
    description: 'E = -dΦ_B/dt, differential form ∇×E = -∂B/∂t.',
    content: 'Faraday\'s law describes how changing magnetic flux induces electric fields and EMF.',
    equations: [
      '\\mathcal{E} = -\\frac{d\\Phi_B}{dt}',
      '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}'
    ]
  },
  'motional-emf': {
    title: 'Motional EMF & Induced Fields',
    description: 'Moving conductors and induced electric fields.',
    content: 'Moving conductors in magnetic fields experience motional EMF due to the Lorentz force.'
  },
  'energy-transfer': {
    title: 'Energy Transfer & Eddy Currents',
    description: 'Energy conversion and dissipation mechanisms.',
    content: 'Electromagnetic induction involves energy transfer between magnetic and electric fields.'
  },
  'inductors-energy': {
    title: 'Inductors & Energy',
    description: 'U = ½LI², magnetic energy storage.',
    content: 'Inductors store magnetic energy and oppose changes in current.',
    equations: ['U = \\frac{1}{2}LI^2']
  },
  'lr-transients': {
    title: 'LR Transients',
    description: 'Exponential current behavior in inductive circuits.',
    content: 'LR circuits exhibit exponential behavior similar to RC circuits but with different time constants.'
  },
  'lc-oscillations': {
    title: 'LC Oscillations',
    description: 'ω₀ = 1/√LC, resonance and harmonic motion.',
    content: 'LC circuits can oscillate at their natural frequency, storing energy alternately in electric and magnetic fields.',
    equations: ['\\omega_0 = \\frac{1}{\\sqrt{LC}}']
  },
  'drude-model': {
    title: 'Drude Model & Conductivity',
    description: 'σ, mobility, mean free time concepts.',
    content: 'The Drude model provides a classical description of electrical conductivity in metals.'
  },
  'macroscopic-current': {
    title: 'Relation to Macroscopic J = σE',
    description: 'Connection between microscopic and macroscopic views.',
    content: 'The macroscopic current density J = σE relates to the microscopic motion of charge carriers.'
  },
  'maxwell-set': {
    title: 'Maxwell Set',
    description: 'Integral and differential forms of Maxwell\'s equations.',
    content: 'Maxwell\'s equations provide a complete description of classical electromagnetism.'
  },
  'em-waves': {
    title: 'EM Wave in Vacuum',
    description: 'c = 1/√(μ₀ε₀), plane-wave relations E⊥B⊥k.',
    content: 'Electromagnetic waves in vacuum travel at the speed of light and have transverse electric and magnetic fields.',
    equations: ['c = \\frac{1}{\\sqrt{\\mu_0\\epsilon_0}}']
  },
  'energy-flow': {
    title: 'Intro to Energy Flow',
    description: 'Poynting vector S = (1/μ₀)E×B.',
    content: 'The Poynting vector describes the flow of electromagnetic energy.',
    equations: ['\\mathbf{S} = \\frac{1}{\\mu_0}\\mathbf{E} \\times \\mathbf{B}']
  },
  'quizzes-homework': {
    title: 'Quizzes/Homework',
    description: 'HW1–HW11; Quiz 1–10',
    content: 'Regular homework assignments and quizzes help reinforce concepts throughout the semester.'
  },
  'midterms': {
    title: 'Midterms',
    description: 'Midterm 1 (HW1–HW4), Midterm 2 (HW5–HW8)',
    content: 'Two midterm exams test understanding of major course topics at intermediate points.'
  },
  'labs': {
    title: 'Labs',
    description: 'Electrostatics, Electric field mapping, RC circuit, Magnetic force, Induction',
    content: 'Hands-on laboratory experiments provide practical experience with electromagnetic phenomena.'
  },
  'worksheets': {
    title: 'Worksheets',
    description: 'Math Worksheet 1–4; Pre/Post-Concept Tests',
    content: 'Mathematical worksheets and concept tests help develop problem-solving skills.'
  },
  'final-exam': {
    title: 'Final Exam',
    description: 'Comprehensive exam covering entire syllabus',
    content: 'The comprehensive final exam covers all course material and determines final grades.'
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
            href="/courses/physics-152"
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
                href="/courses/physics-152"
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
              <span className="text-sm text-gray-500">Physics 152: Electricity and Magnetism</span>
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
                <p className="text-gray-700 leading-relaxed mb-6">{lesson.content}</p>
                
                {/* Display equations if available */}
                {lesson.equations && lesson.equations.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Key Equations</h4>
                    <div className="space-y-3">
                      {lesson.equations.map((equation, index) => (
                        <div key={index} className="text-center">
                          <BlockMath math={equation} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    <span className="text-gray-700">Apply mathematical tools and equations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Solve practical problems and analyze systems</span>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Problem Sets</div>
                    <div className="text-sm text-gray-500">Practice problems with solutions</div>
                  </div>
                </a>

                <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Lab Manuals</div>
                    <div className="text-sm text-gray-500">Laboratory procedures and guides</div>
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
