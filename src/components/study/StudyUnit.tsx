'use client';

import { useState } from 'react';
import { StudyUnitData } from '@/data/study/cs201';
import SectionHeading from './SectionHeading';
import LessonCard from './LessonCard';
import Accordion from './Accordion';
import CodeBlock from './CodeBlock';
import Checklist from './Checklist';
import Quiz from './Quiz';
import SolutionsDrawer from './SolutionsDrawer';

interface StudyUnitProps {
  data: StudyUnitData;
}

export default function StudyUnit({ data }: StudyUnitProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <section 
      id={data.unitId} 
      className="scroll-mt-20 mb-16"
      aria-labelledby={`${data.unitId}-title`}
    >
      {/* Unit Title */}
      <SectionHeading id={`${data.unitId}-title`} level={2} className="mb-6">
        {data.title}
      </SectionHeading>

      {/* Overview */}
      <div 
        id={`${data.unitId}-overview`} 
        className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded"
      >
        <h3 className="font-semibold text-lg mb-3">Overview</h3>
        <ul className="space-y-2">
          {data.overview.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2 flex-shrink-0" aria-hidden="true">→</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lectures */}
      <div id={`${data.unitId}-lectures`} className="mb-12">
        <SectionHeading id={`${data.unitId}-lectures-heading`} level={3} className="mb-6">
          Lectures
        </SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.lectures.map(lecture => (
            <LessonCard key={lecture.id} lecture={lecture} />
          ))}
        </div>
      </div>

      {/* Worked Examples */}
      <div id={`${data.unitId}-examples`} className="mb-12">
        <SectionHeading id={`${data.unitId}-examples-heading`} level={3} className="mb-6">
          Worked Examples
        </SectionHeading>
        <div className="space-y-4">
          {data.workedExamples.map((example, index) => (
            <Accordion key={index} title={example.title}>
              <p className="mb-4 leading-relaxed">{example.content}</p>
              {example.snippet && <CodeBlock snippet={example.snippet} />}
            </Accordion>
          ))}
        </div>
      </div>

      {/* Guided Notes */}
      <div id={`${data.unitId}-notes`} className="mb-12">
        <SectionHeading id={`${data.unitId}-notes-heading`} level={3} className="mb-6">
          Guided Notes (Fill-in-the-Blank)
        </SectionHeading>
        <div className="p-6 bg-yellow-50 border rounded-lg print:bg-white">
          <p className="text-sm text-gray-600 mb-4 print:hidden">
            Print-friendly format. Fill in the blanks to test your understanding.
          </p>
          <ol className="space-y-3 list-decimal list-inside">
            {data.guidedNotes.map((note, index) => (
              <li key={index} className="leading-relaxed font-mono text-sm">
                {note}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Practice */}
      <div id={`${data.unitId}-practice`} className="mb-12">
        <SectionHeading id={`${data.unitId}-practice-heading`} level={3} className="mb-6">
          Practice Problems
        </SectionHeading>
        <div className="space-y-6">
          {data.practice.map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                {group.title}
                <span 
                  className={`ml-3 px-2 py-1 text-xs rounded ${
                    group.title === 'Warm-ups' 
                      ? 'bg-green-100 text-green-800'
                      : group.title === 'Core'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {group.title === 'Warm-ups' ? 'Easy' : group.title === 'Core' ? 'Medium' : 'Hard'}
                </span>
              </h4>
              <ol className="space-y-3 list-decimal list-inside">
                {group.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Lab */}
      <div id={`${data.unitId}-lab`} className="mb-12">
        <SectionHeading id={`${data.unitId}-lab-heading`} level={3} className="mb-6">
          {data.lab.title}
        </SectionHeading>
        <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
          <h4 className="font-semibold mb-3">Specification</h4>
          <ul className="space-y-2 mb-6">
            {data.lab.spec.map((item, index) => (
              <li key={index} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
          
          <h4 className="font-semibold mb-3">Tasks</h4>
          <ol className="space-y-2 mb-6 list-decimal list-inside">
            {data.lab.tasks.map((task, index) => (
              <li key={index} className="leading-relaxed">
                {task}
              </li>
            ))}
          </ol>
          
          {data.lab.extension && data.lab.extension.length > 0 && (
            <>
              <h4 className="font-semibold mb-3">Extension</h4>
              <ul className="space-y-2">
                {data.lab.extension.map((item, index) => (
                  <li key={index} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Mini-Project */}
      <div id={`${data.unitId}-project`} className="mb-12">
        <SectionHeading id={`${data.unitId}-project-heading`} level={3} className="mb-6">
          {data.miniProject.title}
        </SectionHeading>
        <div className="border-2 border-orange-300 rounded-lg p-6 bg-orange-50">
          <h4 className="font-semibold mb-3">Specification</h4>
          <ul className="space-y-2 mb-6">
            {data.miniProject.spec.map((item, index) => (
              <li key={index} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
          
          <h4 className="font-semibold mb-3">Focus Areas</h4>
          <ul className="space-y-2">
            {data.miniProject.focus.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-600 mr-2 flex-shrink-0" aria-hidden="true">★</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quiz */}
      <div id={`${data.unitId}-quiz`} className="mb-12">
        <SectionHeading id={`${data.unitId}-quiz-heading`} level={3} className="mb-6">
          Quiz
        </SectionHeading>
        <Quiz questions={data.quiz} />
      </div>

      {/* Checklist */}
      <div id={`${data.unitId}-checklist`} className="mb-12">
        <SectionHeading id={`${data.unitId}-checklist-heading`} level={3} className="mb-6">
          Checklist
        </SectionHeading>
        <div className="border rounded-lg p-6 bg-gray-50">
          <Checklist unitId={data.unitId} items={data.checklist} />
        </div>
      </div>

      {/* Solutions Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          View Selected Solutions
        </button>
      </div>

      {/* Solutions Drawer */}
      <SolutionsDrawer
        title={data.selectedSolutions.title}
        items={data.selectedSolutions.items}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}

