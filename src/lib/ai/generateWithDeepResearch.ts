/**
 * Enhanced course generation with per-lesson deep research
 * Uses uploaded files for STRUCTURE only, web research for CONTENT
 */

import OpenAI from 'openai';
import { CourseContentV1 } from '@/lib/course-schema';
import { extractCourseSkeleton, type CourseSkeleton } from '@/lib/research/skeletonExtraction';
import { researchAllLessons, summarizeResearch, type LessonResearch } from '@/lib/research/perLessonResearch';
import { extractCitations, generateBibliography, type SimpleSearchResult } from '@/lib/research/simpleResearch';

const RESEARCH_FOCUSED_SYSTEM_PROMPT = `You are an educational content creator building university-level course materials.

Your task: Create comprehensive course content based on a course outline. Generate detailed educational material suitable for students learning the subject for the first time.

INSTRUCTIONS:
1. You will receive a course structure (units and lessons)
2. For each lesson, create detailed educational content
3. Make content thorough enough for independent learning
4. Include explanations, examples, and practice materials
5. Use academic writing style suitable for university courses

CONTENT DEPTH REQUIREMENTS (CRITICAL):
Each lesson must be comprehensive and educational:

1. **Key Concepts Block** (150-200 words):
   - Type: "note"
   - Start with "Key Concepts:" heading
   - 5-8 detailed bullet points (not just one-liners)
   - Each bullet should be 20-40 words explaining the concept
   - Include citations [n] for each concept
   - Example: "- **Newton's First Law**: An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force [1]. This principle is also known as the law of inertia [2]."

2. **Lecture - Conceptual Overview Block** (400-600 words):
   - Type: "note"
   - 4-6 substantial paragraphs written in lecture style
   - Each paragraph should be 80-120 words
   - Explain concepts thoroughly as if teaching to a beginner
   - Use analogies, real-world examples from research
   - Connect concepts to prior knowledge
   - Build understanding step-by-step
   - Cite research sources throughout [n]
   - This should read like a textbook chapter

3. **Lecture - Worked Example/Derivation Block** (300-400 words):
   - Type: "derivation" or "example"
   - Show a complete worked example or derivation
   - Step-by-step with clear explanations at each step
   - Include mathematical reasoning if applicable
   - Show common pitfalls and how to avoid them
   - Verify answer with dimensional analysis or sanity check
   - Cite sources for methods used [n]

4. **Applications & Real-World Context Block** (200-300 words):
   - Type: "note"
   - Start with "Real-World Applications:" or "Applications:"
   - Show 3-4 practical applications from research
   - Explain why the concept matters
   - Include modern uses or historical significance
   - Cite sources [n]

5. **Common Mistakes & Pitfalls Block** (150-200 words):
   - Type: "note"
   - Start with "Common Mistakes:"
   - List 3-4 common student errors
   - Explain why each is wrong
   - Show correct approach
   - Based on research sources about pedagogy

6. **Practice Problems Block** (OPTIONAL):
   - Type: "exercise"
   - 3-5 practice problems for students
   - Range from simple to challenging
   - Based on examples from research

7. **Assessments** (REQUIRED):
   - 4-6 quiz questions per lesson
   - Mix: 2 conceptual, 2 computational, 2 application
   - Each with clear prompt and detailed answer key
   - Questions should test understanding, not just memorization

MINIMUM LENGTH REQUIREMENTS:
- Each lesson MUST be at least 1,200-1,500 words total
- If research provides insufficient content, request more sources
- Content blocks should be detailed paragraphs, not bullet lists
- Educational rigor is more important than brevity

WRITING STYLE:
- Academic but accessible
- Explain thoroughly - assume student is learning for first time
- Use clear examples from research
- Build concepts progressively
- Connect to prior knowledge
- Motivate why concepts matter
- No first/second person
- No filler or fluff
- Rich, educational, comprehensive

RESPONSE FORMAT:
Return ONLY valid JSON matching the exact structure provided in the user prompt.`;

export type DeepResearchResult = {
  content: CourseContentV1;
  skeleton: CourseSkeleton;
  researchByLesson: Map<string, LessonResearch>;
  allSources: SimpleSearchResult[];
  citationsUsed: number[];
  researchSummary: ReturnType<typeof summarizeResearch>;
};

/**
 * Generate course with deep per-lesson research
 */
export async function generateWithDeepResearch(
  seedMeta: {
    title: string;
    code?: string;
    term?: string;
    description?: string;
  },
  uploadedFiles: Array<{ source: string; text: string }>,
  options: {
    maxSourcesPerLesson?: number;
    concurrency?: number;
  } = {}
): Promise<DeepResearchResult> {
  const { maxSourcesPerLesson = 5, concurrency = 3 } = options;

  console.log('\n' + '='.repeat(80));
  console.log('🔬 DEEP RESEARCH GENERATION - STARTED');
  console.log('='.repeat(80));
  console.log(`Course: ${seedMeta.title}`);
  console.log(`Files: ${uploadedFiles.length}`);
  console.log(`Max sources per lesson: ${maxSourcesPerLesson}`);
  console.log('='.repeat(80) + '\n');

  // STAGE 1: Extract skeleton from uploaded files
  console.log('📋 STAGE 1: Extracting course skeleton...');
  const skeleton = extractCourseSkeleton(uploadedFiles, seedMeta);
  const allLessons = skeleton.units.flatMap(u => u.lessons);
  
  console.log(`  ✓ Extracted: ${skeleton.units.length} units, ${allLessons.length} lessons`);
  skeleton.units.forEach((unit, i) => {
    console.log(`    Unit ${i + 1}: ${unit.unitTitle} (${unit.lessons.length} lessons)`);
  });

  // STAGE 2: Research each lesson
  console.log('\n🔍 STAGE 2: Researching lessons...');
  const lessonResearch = await researchAllLessons(
    allLessons,
    skeleton.courseTitle,
    { maxSources: maxSourcesPerLesson, concurrency }
  );

  const researchMap = new Map<string, LessonResearch>();
  lessonResearch.forEach(r => researchMap.set(r.lessonId, r));

  const researchSummary = summarizeResearch(lessonResearch);
  console.log(`  ✓ Research complete:`);
  console.log(`    Total sources: ${researchSummary.totalSources}`);
  console.log(`    Lessons with sources: ${researchSummary.lessonsWithSources}/${researchSummary.totalLessons}`);
  console.log(`    Top domains:`, researchSummary.topDomains.map(d => `${d.domain}(${d.count})`).join(', '));

  // STAGE 3: Generate content with AI
  console.log('\n🤖 STAGE 3: Generating course content...');
  
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o';

  // Build structured prompt with research per lesson
  const prompt = buildResearchFocusedPrompt(skeleton, researchMap, seedMeta);

  console.log(`  Model: ${modelName}`);
  console.log(`  Prompt size: ~${Math.round(prompt.length / 4)} tokens`);

  // Calculate required tokens based on skeleton
  // 1,500 words/lesson × 4 chars/word / 4 chars/token = ~375 tokens/lesson
  // 12 lessons × 375 = 4,500 tokens minimum
  // Add overhead for structure, assessments, etc. = ~6,000-8,000 tokens
  const estimatedTokens = skeleton.units.reduce((sum, u) => sum + u.lessons.length, 0) * 500;
  const maxTokens = Math.min(Math.max(estimatedTokens, 8000), 16000); // 8k-16k range
  
  console.log(`  Estimated tokens needed: ${estimatedTokens}, using: ${maxTokens}`);
  
  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: 'system', content: RESEARCH_FOCUSED_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    // Note: response_format can cause truncation with large responses
    // Removed to allow full output, will parse JSON manually
    temperature: 0.8,  // Slightly higher for creativity
    max_completion_tokens: maxTokens  // Dynamic based on course size
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('No response from AI');
  }

  console.log(`  ✓ AI response received (${responseContent.length} chars)`);

  // Parse and validate - with better error handling for malformed JSON
  let parsedContent;
  try {
    parsedContent = JSON.parse(responseContent);
  } catch (parseError: any) {
    console.error('❌ JSON parsing failed:', parseError.message);
    console.log('  Response preview:', responseContent.slice(0, 500));
    console.log('  Response end:', responseContent.slice(-500));
    
    // Try to fix common JSON issues
    let fixedResponse = responseContent;
    
    // Remove any markdown code blocks if present
    fixedResponse = fixedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find valid JSON object
    const jsonStart = fixedResponse.indexOf('{');
    const jsonEnd = fixedResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      fixedResponse = fixedResponse.slice(jsonStart, jsonEnd + 1);
      console.log('  Attempting to parse extracted JSON...');
      
      try {
        parsedContent = JSON.parse(fixedResponse);
        console.log('  ✅ Successfully parsed after cleanup');
      } catch (secondError) {
        console.error('  ❌ Still failed after cleanup');
        throw new Error(`AI returned malformed JSON: ${parseError.message}. Response length: ${responseContent.length} chars`);
      }
    } else {
      throw new Error(`AI returned malformed JSON: ${parseError.message}`);
    }
  }
  
  // VALIDATION: Check if AI generated all units
  const generatedUnits = parsedContent.units?.length || 0;
  const expectedUnits = skeleton.units.length;
  
  if (generatedUnits < expectedUnits) {
    console.error(`❌ AI only generated ${generatedUnits} units, expected ${expectedUnits}`);
    console.error('   AI did not follow instructions! Retrying with stronger prompt...');
    throw new Error(`AI only generated ${generatedUnits}/${expectedUnits} units. Expected all ${expectedUnits} units from skeleton.`);
  }
  
  console.log(`  ✅ Validation passed: ${generatedUnits}/${expectedUnits} units generated`);
  
  const content: CourseContentV1 = {
    courseMeta: {
      title: parsedContent.courseMeta?.title || seedMeta.title,
      code: parsedContent.courseMeta?.code || seedMeta.code || '',
      term: parsedContent.courseMeta?.term || seedMeta.term || '',
      description: parsedContent.courseMeta?.description || skeleton.courseDescription || '',
      prerequisites: parsedContent.courseMeta?.prerequisites || []
    },
    units: parsedContent.units || []
  };

  // STAGE 4: Extract citations and build bibliography
  console.log('\n📚 STAGE 4: Processing citations...');
  
  const allSources = lessonResearch.flatMap(r => r.sources);
  const allContentText = content.units
    .flatMap(u => u.lessons)
    .flatMap(l => l.contentBlocks)
    .map(b => b.body)
    .join('\n');

  const citationsUsed = extractCitations(allContentText);
  console.log(`  ✓ Found ${citationsUsed.length} citations`);

  // Add bibliography to last lesson
  if (citationsUsed.length > 0 && content.units.length > 0) {
    const lastUnit = content.units[content.units.length - 1];
    if (lastUnit.lessons && lastUnit.lessons.length > 0) {
      const lastLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
      const bibliography = generateBibliography(allSources, citationsUsed);
      
      if (bibliography) {
        lastLesson.contentBlocks.push({
          type: 'note',
          body: bibliography
        });
        console.log(`  ✓ Added bibliography with ${citationsUsed.length} references`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ DEEP RESEARCH GENERATION - COMPLETE');
  console.log('='.repeat(80));
  console.log(`Units: ${content.units.length}`);
  console.log(`Lessons: ${content.units.reduce((sum, u) => sum + (u.lessons?.length || 0), 0)}`);
  console.log(`Research sources: ${allSources.length}`);
  console.log(`Citations: ${citationsUsed.length}`);
  console.log('='.repeat(80) + '\n');

  return {
    content,
    skeleton,
    researchByLesson: researchMap,
    allSources,
    citationsUsed,
    researchSummary
  };
}

/**
 * Build prompt that emphasizes research over uploaded content
 */
function buildResearchFocusedPrompt(
  skeleton: CourseSkeleton,
  researchMap: Map<string, LessonResearch>,
  seedMeta: { title: string; code?: string; term?: string; description?: string }
): string {
  let prompt = `Create a comprehensive educational course where students can LEARN THE MATERIAL thoroughly.

COURSE INFORMATION:
- Title: ${skeleton.courseTitle}
- Code: ${skeleton.courseCode || 'Not specified'}
- Term: ${skeleton.courseTerm || 'Not specified'}
- Description: ${skeleton.courseDescription || 'Not specified'}

CRITICAL REQUIREMENTS:
1. Generate ${skeleton.units.length} units with comprehensive content
2. Each lesson must be 1,200-1,500 words (MINIMUM)
3. Write content from RESEARCH SOURCES only - ignore the syllabus text
4. Make content educational enough for a beginner to learn from
5. Include detailed explanations, examples, applications, and assessments
6. Add citations [n] throughout

SKELETON AND RESEARCH:

`;

  skeleton.units.forEach((unit, unitIdx) => {
    prompt += `\n${'='.repeat(80)}\n`;
    prompt += `UNIT ${unitIdx + 1} of ${skeleton.units.length}: ${unit.unitTitle}\n`;
    prompt += `${'='.repeat(80)}\n`;
    prompt += `\nThis unit should teach students about: ${unit.unitTitle}\n`;
    prompt += `Number of lessons in this unit: ${unit.lessons.length}\n\n`;

    unit.lessons.forEach((lesson, lessonIdx) => {
      const research = researchMap.get(lesson.lessonId);
      
      prompt += `\n${'-'.repeat(80)}\n`;
      prompt += `LESSON ${unitIdx + 1}.${lessonIdx + 1}: ${lesson.lessonTitle}\n`;
      prompt += `${'-'.repeat(80)}\n`;
      prompt += `Focus keywords: ${lesson.keywords.join(', ')}\n`;
      
      if (lesson.formulas.length > 0) {
        prompt += `Key formulas to cover: ${lesson.formulas.slice(0, 3).join(', ')}\n`;
      }

      if (research && research.sources.length > 0) {
        prompt += `\n📚 RESEARCH SOURCES (${research.sources.length} academic sources):\n`;
        prompt += research.researchContext;
        prompt += `\n✍️ WRITING INSTRUCTIONS FOR THIS LESSON:\n`;
        prompt += `- Write 1,200-1,500 words using these ${research.sources.length} sources\n`;
        prompt += `- Create 5-6 comprehensive content blocks\n`;
        prompt += `- Include Key Concepts, Conceptual Overview, Worked Example, Applications, Common Mistakes\n`;
        prompt += `- Add 4-6 quiz questions\n`;
        prompt += `- Cite sources throughout using [n]\n`;
        prompt += `- Make it educational - a student should be able to learn ${lesson.lessonTitle} from this lesson alone\n\n`;
      } else {
        prompt += `\n⚠️ No research sources found for this lesson.\n`;
        prompt += `\n✍️ WRITING INSTRUCTIONS (No Research Available):\n`;
        prompt += `- Create comprehensive educational content from your knowledge\n`;
        prompt += `- Write 1,200-1,500 words covering ${lesson.lessonTitle}\n`;
        prompt += `- Include all required content blocks (Key Concepts, Overview, Example, etc.)\n`;
        prompt += `- Make it detailed and educational for beginners\n`;
        prompt += `- Use proper academic style with examples and explanations\n\n`;
      }
    });
  });

  prompt += `\n\nRETURN FORMAT:
Return ONLY valid JSON. You MUST generate ALL ${skeleton.units.length} units listed above.

CRITICAL: Generate exactly these units:
${skeleton.units.map((u, i) => `- Unit ${i + 1}: ${u.unitTitle} (with ${u.lessons.length} lessons)`).join('\n')}

JSON structure:
{
  "courseMeta": {
    "title": "${skeleton.courseTitle}",
    "code": "${skeleton.courseCode || 'COURSE'}",
    "term": "${skeleton.courseTerm || ''}",
    "description": "Comprehensive course description (100-200 words)",
    "prerequisites": ["prerequisite 1", "prerequisite 2"]
  },
  "units": [
    // UNIT 1 - ${skeleton.units[0]?.unitTitle || 'Unit 1'}
    {
      "title": "${skeleton.units[0]?.unitTitle || 'Unit 1'}",
      "overview": "Comprehensive unit overview explaining what students will learn and why it matters (200-300 words)",
      "learningObjectives": [
        "Students will be able to [specific skill/knowledge]",
        "Students will understand [concept]",
        "Students will apply [technique] to solve [problems]"
      ],
      "keyTerms": ["term1", "term2", "term3", "term4"],
      "lessons": [
        {
          "title": "${skeleton.units[0]?.lessons[0]?.lessonTitle || 'Lesson 1'}",
          "summary": "Lesson summary (50-100 words)",
          "readings": ["Recommended reading 1 [n]", "Recommended reading 2 [n]"],
          "contentBlocks": [
            {
              "type": "note",
              "body": "Key Concepts:\\n\\n- **Concept 1**: Detailed explanation of first concept (30-50 words) with examples and significance [1][2]\\n\\n- **Concept 2**: Detailed explanation of second concept including when and why it's used [3]\\n\\n- **Concept 3**: Third concept with context and applications [4]\\n\\n- **Concept 4**: Fourth concept building on previous ones [5]\\n\\n- **Concept 5**: Fifth concept with real-world relevance [6]"
            },
            {
              "type": "note",
              "body": "Conceptual Overview:\\n\\nFirst paragraph introducing the topic and its importance (80-120 words) [1][2].\\n\\nSecond paragraph explaining the fundamental principles in detail with examples (100-150 words) [3][4].\\n\\nThird paragraph connecting to prior knowledge and broader context (80-120 words) [5].\\n\\nFourth paragraph discussing applications and significance (80-120 words) [6][7].\\n\\nFifth paragraph summarizing key insights and preview of what's next (60-100 words)."
            },
            {
              "type": "derivation",
              "body": "Worked Example:\\n\\nProblem: [Clear problem statement]\\n\\nGiven: [What we know]\\n\\nFind: [What we're solving for]\\n\\nSolution:\\nStep 1: [Detailed explanation] [n]\\nStep 2: [Detailed explanation with reasoning] [n]\\nStep 3: [Mathematical manipulation or logical step] [n]\\nStep 4: [Continue building the solution] [n]\\n\\nVerification: [Check units, limits, or sanity check] [n]\\n\\nConclusion: [Interpret the result in context] [n]"
            },
            {
              "type": "note",
              "body": "Real-World Applications:\\n\\nApplication 1: [Detailed real-world use case] (60-80 words) [n]\\n\\nApplication 2: [Another practical application] (60-80 words) [n]\\n\\nApplication 3: [Modern or historical application] (60-80 words) [n]\\n\\nWhy This Matters: [Broader significance and impact] (80-100 words) [n]"
            },
            {
              "type": "note",
              "body": "Common Mistakes & How to Avoid Them:\\n\\nMistake 1: [Common student error] - Why it's wrong: [Explanation] - Correct approach: [How to do it right] (60-80 words)\\n\\nMistake 2: [Another common error] - [Explanation and correction] (60-80 words)\\n\\nMistake 3: [Third common error] - [Explanation and correction] (60-80 words)"
            },
            {
              "type": "exercise",
              "body": "Practice Problems:\\n\\n1. [Simple problem to build confidence]\\n2. [Moderate problem applying concepts]\\n3. [Challenging problem requiring synthesis]\\n4. [Real-world application problem]\\n5. [Conceptual reasoning problem]"
            }
          ],
          "assessments": [
            {"type": "quiz", "prompt": "Conceptual question testing understanding of core concept", "answerKey": "Detailed answer with explanation"},
            {"type": "quiz", "prompt": "Computational question requiring calculation", "answerKey": "Step-by-step solution"},
            {"type": "quiz", "prompt": "Application question using real-world scenario", "answerKey": "Detailed answer with reasoning"},
            {"type": "quiz", "prompt": "Analysis question requiring critical thinking", "answerKey": "Comprehensive explanation"},
            {"type": "quiz", "prompt": "Synthesis question connecting multiple concepts", "answerKey": "Detailed integrated answer"}
          ]
        }
      ]
    },
    // UNIT 2 - ${skeleton.units[1]?.unitTitle || 'Unit 2'}
    {
      "title": "${skeleton.units[1]?.unitTitle || 'Unit 2'}",
      "overview": "...",
      "learningObjectives": [...],
      "keyTerms": [...],
      "lessons": [ /* ${skeleton.units[1]?.lessons.length || 2} lessons with same structure */ ]
    }
    // ... CONTINUE FOR ALL ${skeleton.units.length} UNITS
    // YOU MUST INCLUDE: ${skeleton.units.map((u, i) => `Unit ${i + 1}: ${u.unitTitle}`).join(', ')}
  ]
}

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. Generate ALL ${skeleton.units.length} units listed above - NOT JUST ONE!
2. Each unit must have ALL its lessons (${skeleton.units.map((u, i) => `Unit ${i+1}: ${u.lessons.length} lessons`).join(', ')})
3. Each lesson MUST be 1,200-1,500 words minimum
4. Use research sources as primary content (not the skeleton)
5. Make content educational and comprehensive
6. Students should be able to LEARN from this, not just review
7. Include detailed explanations, not just summaries
8. Add many citations [n] throughout

VERIFICATION: Before returning, count your units array - it must have ${skeleton.units.length} elements!`;

  return prompt;
}

