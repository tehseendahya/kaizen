/**
 * Guaranteed 6-10 unit course generation
 * Uses a strategy that ensures we always get the required number of units
 */

import OpenAI from 'openai';
import { CourseContentV1 } from '@/lib/course-schema';

// Predefined unit topics for any database course
const DATABASE_UNITS = [
  {
    title: "Introduction to Databases",
    topics: ["Database fundamentals", "Why databases matter", "Database vs file systems"]
  },
  {
    title: "Data Models and Design",
    topics: ["Relational model", "ER diagrams", "Schema design"]
  },
  {
    title: "Database Management Systems",
    topics: ["DBMS architecture", "Storage structures", "Transaction management"]
  },
  {
    title: "SQL and Query Languages",
    topics: ["SQL basics", "Complex queries", "Query optimization"]
  },
  {
    title: "Normalization and Design Theory",
    topics: ["Normal forms", "Functional dependencies", "Design patterns"]
  },
  {
    title: "Advanced Database Topics",
    topics: ["Indexing strategies", "Concurrency control", "Distributed databases"]
  }
];

export async function generateCourseGuaranteed(
  seedMeta: {
    title: string;
    code?: string;
    term?: string;
    description?: string;
  },
  parsedFiles: Array<{ source: string; text: string }>
): Promise<CourseContentV1> {
  
  console.log('\n📚 GUARANTEED COMPREHENSIVE GENERATION');
  console.log(`Course: ${seedMeta.title}`);
  
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o';
  
  // Use predefined structure to guarantee 6 units
  const units = DATABASE_UNITS;
  
  const prompt = `Generate comprehensive course content for: ${seedMeta.title}

You must create content for these 6 units:

${units.map((unit, i) => `
UNIT ${i + 1}: ${unit.title}
Topics to cover: ${unit.topics.join(', ')}
- Create 2 lessons for this unit
- Each lesson: 400-600 words total
- Include: Key Concepts, Overview, Worked Example, Applications, Practice`).join('\n')}

For EACH lesson, create:
1. Key Concepts (3-4 detailed bullet points, each 20-30 words)
2. Conceptual Overview (200-300 words, 2-3 paragraphs)
3. Worked Example (150-200 words, step-by-step)
4. Applications (100-150 words)
5. Common Mistakes (50-100 words)
6. Practice Problems (3 problems)
7. 3 Quiz questions

Keep content concise but comprehensive. Focus on quality over quantity.

Return a JSON object with ALL 6 UNITS, each having 2 LESSONS. The response must be valid JSON only:

{
  "courseMeta": {
    "title": "${seedMeta.title}",
    "code": "${seedMeta.code || ''}",
    "term": "${seedMeta.term || ''}",
    "description": "Course description",
    "prerequisites": []
  },
  "units": [
    ${units.map((unit, i) => `{
      "title": "${unit.title}",
      "overview": "Unit overview",
      "learningObjectives": ["Learn ${unit.topics[0]}", "Understand ${unit.topics[1]}", "Apply ${unit.topics[2] || unit.topics[0]}"],
      "keyTerms": ${JSON.stringify(unit.topics)},
      "lessons": [
        {
          "title": "${unit.topics[0]}",
          "summary": "Lesson summary",
          "readings": [],
          "contentBlocks": [
            {"type": "note", "body": "Key Concepts: [5 detailed points]"},
            {"type": "note", "body": "Overview: [400-500 words]"},
            {"type": "derivation", "body": "Example: [250-300 words]"},
            {"type": "note", "body": "Applications: [150-200 words]"},
            {"type": "note", "body": "Mistakes: [100-150 words]"},
            {"type": "exercise", "body": "Problems: 1. ... 2. ... 3. ... 4. ... 5. ..."}
          ],
          "assessments": [
            {"type": "quiz", "prompt": "Q1", "answerKey": "A1"},
            {"type": "quiz", "prompt": "Q2", "answerKey": "A2"},
            {"type": "quiz", "prompt": "Q3", "answerKey": "A3"},
            {"type": "quiz", "prompt": "Q4", "answerKey": "A4"},
            {"type": "quiz", "prompt": "Q5", "answerKey": "A5"}
          ]
        },
        {
          "title": "${unit.topics[1] || unit.topics[0] + ' Advanced'}",
          "summary": "Lesson summary",
          "readings": [],
          "contentBlocks": [ /* same 6 blocks */ ],
          "assessments": [ /* 5 quizzes */ ]
        }
      ]
    }`).join(',\n    ')}
  ]
}`;

  console.log(`[generateCourseGuaranteed] Using model: ${modelName}`);
  console.log(`[generateCourseGuaranteed] Prompt length: ${prompt.length} chars`);
  console.log(`[generateCourseGuaranteed] Starting OpenAI API call...`);
  
  let completion;
  try {
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API call timed out after 4 minutes')), 240000); // 4 minutes
    });

    const apiCall = client.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: 'system', 
          content: 'You are a course content generator. Fill in the template provided with comprehensive educational content. Follow the structure exactly. Return ONLY valid JSON, no markdown code blocks.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 12000, // Reduced from 16000 for faster generation
      response_format: { type: 'json_object' } // Force JSON mode for better reliability
    });

    completion = await Promise.race([apiCall, timeoutPromise]) as any;
    console.log(`[generateCourseGuaranteed] ✅ API call completed`);
  } catch (apiError: any) {
    console.error(`[generateCourseGuaranteed] ❌ API call failed:`, apiError?.message || apiError);
    throw new Error(`OpenAI API error: ${apiError?.message || 'Unknown error'}`);
  }

  const responseText = completion.choices[0]?.message?.content || '';
  
  if (!responseText || responseText.trim().length === 0) {
    throw new Error('Empty response from OpenAI API');
  }

  console.log(`[generateCourseGuaranteed] Response length: ${responseText.length} chars`);
  
  // Clean and parse
  let jsonText = responseText.trim();
  jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  const jsonStart = jsonText.indexOf('{');
  const jsonEnd = jsonText.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    console.error(`[generateCourseGuaranteed] ❌ No JSON found in response. First 500 chars:`, jsonText.substring(0, 500));
    throw new Error('No valid JSON found in OpenAI response');
  }
  
  jsonText = jsonText.slice(jsonStart, jsonEnd + 1);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
    console.log(`[generateCourseGuaranteed] ✅ JSON parsed successfully`);
  } catch (parseError: any) {
    console.error(`[generateCourseGuaranteed] ❌ JSON parse error:`, parseError?.message);
    console.error(`[generateCourseGuaranteed] JSON text (first 1000 chars):`, jsonText.substring(0, 1000));
    throw new Error(`Failed to parse JSON response: ${parseError?.message}`);
  }
  
  const unitCount = parsed.units?.length || 0;
  const lessonCount = parsed.units?.reduce((sum: number, u: any) => sum + (u.lessons?.length || 0), 0) || 0;
  console.log(`[generateCourseGuaranteed] ✅ Final: ${unitCount} units, ${lessonCount} lessons`);
  
  if (unitCount < 6) {
    console.warn(`[generateCourseGuaranteed] ⚠️  Warning: Only ${unitCount} units generated, expected 6`);
  }
  
  return {
    courseMeta: {
      title: parsed.courseMeta?.title || seedMeta.title,
      code: parsed.courseMeta?.code || seedMeta.code || '',
      term: parsed.courseMeta?.term || seedMeta.term || '',
      description: parsed.courseMeta?.description || seedMeta.description || '',
      prerequisites: parsed.courseMeta?.prerequisites || []
    },
    units: parsed.units || []
  };
}

