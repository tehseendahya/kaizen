'use client';

import CourseShell, { CourseData } from '@/components/course/CourseShell';

// Keep the full Physics 152 courseData from the current file:
const courseData: CourseData = {
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

// Keep the full getLessonContent map from the current file:
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

// Keep the full getLessonEquations map from the current file:
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

export default function Physics152Page() {
  return (
    <CourseShell
      courseData={courseData}
      getLessonContent={getLessonContent}
      getLessonEquations={getLessonEquations}
      courseShort="Physics 152"
    />
  );
}

