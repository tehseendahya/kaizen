'use client';
import CourseShell, { CourseData } from './CourseShell';

type Props = {
  courseData: CourseData;
  contentMap: Record<string, string>;
  courseShort?: string;
};

export default function CourseShellClient({ courseData, contentMap, courseShort }: Props) {
  const getLessonContent = (lessonId: string) => contentMap[lessonId] ?? '';
  const getLessonEquations = (_lessonId: string) => {
    void _lessonId;
    return [] as string[];
  };
  return (
    <CourseShell
      courseData={courseData}
      getLessonContent={getLessonContent}
      getLessonEquations={getLessonEquations}
      courseShort={courseShort}
      
    />
  );
}
