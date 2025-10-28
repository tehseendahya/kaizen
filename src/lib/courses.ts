export type CourseUnitItem = { id: string; title: string };
export type CourseUnit = { id: string; title: string; items: CourseUnitItem[] };
export type Course = {
  slug: string;
  title: string;
  meta: string; // e.g., "10 units • 30 sub-units"
  units: CourseUnit[];
};

export const COURSES: Course[] = [
  {
    slug: 'cs201',
    title: 'CS201 · Data Structures',
    meta: '6 units • 22 sub-units',
    units: [
      { id: 'u1', title: 'Arrays & Lists', items: [
        { id: 'array-basics', title: 'Array Basics' },
        { id: 'arraylist-practice', title: 'ArrayList Practice' },
        { id: 'array-algorithms', title: 'Array Algorithms' },
      ]},
      { id: 'u2', title: 'Linked Lists', items: [
        { id: 'linked-list-intro', title: 'Introduction to Linked Lists' },
        { id: 'linked-list-operations', title: 'Linked List Operations' },
        { id: 'doubly-linked', title: 'Doubly Linked Lists' },
      ]},
      { id: 'u3', title: 'Stacks & Queues', items: [
        { id: 'stack-implementation', title: 'Stack Implementation' },
        { id: 'queue-implementation', title: 'Queue Implementation' },
        { id: 'stack-queue-applications', title: 'Applications' },
      ]},
      { id: 'u4', title: 'Trees', items: [
        { id: 'tree-basics', title: 'Tree Basics' },
        { id: 'binary-trees', title: 'Binary Trees' },
        { id: 'tree-traversal', title: 'Tree Traversal' },
      ]},
      { id: 'u5', title: 'Hash Tables', items: [
        { id: 'hash-functions', title: 'Hash Functions' },
        { id: 'hash-table-implementation', title: 'Hash Table Implementation' },
        { id: 'hash-applications', title: 'Hash Table Applications' },
      ]},
      { id: 'u6', title: 'Review & Practice', items: [
        { id: 'java-review', title: 'Java Review' },
        { id: 'overview', title: 'Course Overview' },
      ]},
    ],
  },
  {
    slug: 'phys102l',
    title: 'PHYSICS 102L · Electromagnetism Lab',
    meta: '4 units • 12 sub-units',
    units: [
      { id: 'p1', title: 'Electrostatics', items: [
        { id: 'charges', title: 'Charges & Fields' },
        { id: 'potentials', title: 'Electric Potential' },
      ]},
      { id: 'p2', title: 'Magnetism', items: [
        { id: 'magnetic-fields', title: 'Magnetic Fields' },
        { id: 'induction', title: 'Induction' },
      ]},
      { id: 'p3', title: 'AC Circuits', items: [
        { id: 'rc', title: 'RC Circuits' },
        { id: 'rlc', title: 'RLC Circuits' },
      ]},
      { id: 'p4', title: 'Waves', items: [
        { id: 'em-waves', title: 'EM Waves' },
      ]},
    ],
  },
];

export function getCourseBySlug(slug: string): Course {
  const c = COURSES.find((c) => c.slug === slug);
  if (!c) throw new Error(`Course not found: ${slug}`);
  return c;
}

