'use client';

import CourseShell, { CourseData } from '@/components/course/CourseShell';

const courseData: CourseData = {
  title: "%%COURSE_TITLE%%",
  units: [
    {
      id: "unit1",
      title: "%%UNIT_1_TITLE%%",
      intro: "%%UNIT_1_INTRO%%",
      lessons: [
        { id: "u1l1", title: "%%U1_L1_TITLE%%", description: "%%U1_L1_DESC%%" },
        { id: "u1l2", title: "%%U1_L2_TITLE%%", description: "%%U1_L2_DESC%%" },
        { id: "u1l3", title: "%%U1_L3_TITLE%%", description: "%%U1_L3_DESC%%" },
      ],
    },
  ],
};

const getLessonContent = (lessonId: string) => `%%CONTENT_${lessonId}%%`;
const getLessonEquations = (lessonId: string) => [`%%EQ_${lessonId}_1%%`];

export default function CoursePage() {
  return (
    <CourseShell
      courseData={courseData}
      getLessonContent={getLessonContent}
      getLessonEquations={getLessonEquations}
      courseShort="%%COURSE_SHORT%%"
    />
  );
}
