"use client";

import CourseShell, { CourseData } from '@/components/course/CourseShell';

const courseData: CourseData = {
  title: 'Physics 152: Electricity & Magnetism',
  units: [
    {
      id: 'unit1',
      title: 'Unit 1: Electrostatics Foundations',
      intro: 'Point charge interactions, superposition, field as a vector field.',
      lessons: [
        { id: 'coulombs-law', title: "Coulomb's Law & Superposition", description: 'Force and field from point charges; superposition principle.' },
        { id: 'electric-field-lines', title: 'Electric Field Lines & Flux', description: 'Flux through surfaces; symmetry intuition.' },
        { id: 'multivariable-tools', title: 'Multivariable Tools', description: 'Gradient, line/surface/volume integrals; notation.' },
      ],
    },
  ],
};

const getLessonContent = (lessonId: string) => 'Content for this lesson will be available soon.';
const getLessonEquations = (lessonId: string) => [] as string[];

export default function CoursePage() {
  return (
    <CourseShell
      courseData={courseData}
      getLessonContent={getLessonContent}
      getLessonEquations={getLessonEquations}
      courseShort="Physics 152"
    />
  );
}

