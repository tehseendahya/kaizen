/**
 * Simple comprehensive course generation without complex research
 * Generates 6-10 units with detailed content directly from OpenAI
 */

import OpenAI from 'openai';
import { CourseContentV1 } from '@/lib/course-schema';

export async function generateComprehensiveCourse(
  seedMeta: {
    title: string;
    code?: string;
    term?: string;
    description?: string;
  },
  parsedFiles: Array<{ source: string; text: string }>
): Promise<CourseContentV1> {
  
  console.log('\n📚 COMPREHENSIVE COURSE GENERATION');
  console.log(`Course: ${seedMeta.title}`);
  console.log(`Files: ${parsedFiles.length}`);
  
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o';
  
  // Extract topics from uploaded files
  const combinedText = parsedFiles.map(p => p.text).join('\n\n').slice(0, 10000);
  
  const systemPrompt = `You are a university professor creating detailed course materials.

Generate comprehensive educational content that students can learn from.

Requirements for EVERY lesson:
- 800-1,200 words minimum
- 5-6 detailed content blocks
- Clear explanations for beginners
- Worked examples
- Practice problems
- 4-5 quiz questions

Make content educational, not just summaries.`;

  const userPrompt = `Create a comprehensive course for: ${seedMeta.title}

${seedMeta.description ? `Description: ${seedMeta.description}\n\n` : ''}
${combinedText ? `Reference material (use to identify topics):\n${combinedText.slice(0, 2000)}\n\n` : ''}

REQUIREMENTS - READ CAREFULLY:
1. YOU MUST GENERATE EXACTLY 6 UNITS (minimum) - DO NOT GENERATE FEWER
2. Each unit MUST have 2 lessons (total 12 lessons minimum)
3. Each lesson must include:
   - Key Concepts (5-7 detailed bullet points, each 30-50 words explaining the concept thoroughly)
   - Conceptual Overview (400-600 words in 4-5 paragraphs, explaining like a textbook)
   - Worked Example (300-400 words with step-by-step solution and explanation)
   - Real-World Applications (200-300 words with 3 specific examples)
   - Common Mistakes (150-200 words explaining what students get wrong)
   - Practice Problems (5 problems ranging from simple to challenging)
4. Each lesson must have 5 quiz questions with detailed answer keys
5. Total: 800-1,200 words per lesson minimum

Return ONLY valid JSON in this structure:
{
  "courseMeta": {
    "title": "${seedMeta.title}",
    "code": "${seedMeta.code || 'COURSE'}",
    "term": "${seedMeta.term || ''}",
    "description": "Comprehensive 150-200 word description",
    "prerequisites": []
  },
  "units": [
    {
      "title": "Introduction to Databases",
      "overview": "200-300 word unit overview",
      "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
      "keyTerms": ["term1", "term2", "term3"],
      "lessons": [
        {
          "title": "Database Systems Overview",
          "summary": "50-100 word summary",
          "readings": [],
          "contentBlocks": [
            {
              "type": "note",
              "body": "Key Concepts:\\n\\n- **Concept 1 Name**: Detailed 30-50 word explanation of what this concept means, why it matters, and how it's used. Include specific examples and context.\\n\\n- **Concept 2 Name**: Another detailed explanation with examples and significance.\\n\\n- **Concept 3 Name**: Third concept explained thoroughly.\\n\\n- **Concept 4 Name**: Fourth concept with context.\\n\\n- **Concept 5 Name**: Fifth concept with applications."
            },
            {
              "type": "note",
              "body": "Conceptual Overview:\\n\\nFirst paragraph (100-120 words): Introduce the topic, explain its importance, and provide context for why students need to learn this.\\n\\nSecond paragraph (100-120 words): Explain the fundamental principles in detail with examples and analogies to help understanding.\\n\\nThird paragraph (100-120 words): Connect the concepts to prior knowledge and show how they build on previous lessons.\\n\\nFourth paragraph (100-120 words): Discuss applications and real-world significance of these concepts.\\n\\nFifth paragraph (80-100 words): Summarize key insights and preview what comes next."
            },
            {
              "type": "derivation",
              "body": "Worked Example:\\n\\nProblem: [Clear problem statement]\\n\\nGiven Information: [What we know]\\n\\nObjective: [What we're solving for]\\n\\nSolution:\\nStep 1: [Detailed explanation of first step with reasoning - 40-60 words]\\n\\nStep 2: [Detailed explanation of second step with mathematical/logical reasoning - 40-60 words]\\n\\nStep 3: [Continue with detailed explanation - 40-60 words]\\n\\nStep 4: [Further steps as needed - 40-60 words]\\n\\nVerification: [Check the answer makes sense, verify units, test edge cases - 30-50 words]\\n\\nConclusion: [Interpret the result and explain its significance - 30-50 words]"
            },
            {
              "type": "note",
              "body": "Real-World Applications:\\n\\n**Application 1**: [60-80 word description of a specific real-world use case with concrete examples]\\n\\n**Application 2**: [60-80 word description of another practical application in industry or research]\\n\\n**Application 3**: [60-80 word description of modern or historical application showing relevance]\\n\\n**Why This Matters**: [80-100 words explaining the broader impact and significance of these concepts in the field]"
            },
            {
              "type": "note",
              "body": "Common Mistakes & Misconceptions:\\n\\n**Mistake 1**: [Common error students make] - **Why it's wrong**: [Explanation] - **Correct approach**: [How to do it right] (total 60-80 words)\\n\\n**Mistake 2**: [Another common error] - **Why it's wrong**: [Explanation] - **Correct approach**: [Correction] (60-80 words)\\n\\n**Mistake 3**: [Third misconception] - **Why it's wrong**: [Explanation] - **Correct approach**: [Correction] (60-80 words)"
            },
            {
              "type": "exercise",
              "body": "Practice Problems:\\n\\n1. [Simple problem to build confidence and test basic understanding]\\n\\n2. [Moderate problem requiring application of concepts]\\n\\n3. [Challenging problem requiring synthesis of multiple ideas]\\n\\n4. [Real-world scenario problem]\\n\\n5. [Conceptual reasoning problem]"
            }
          ],
          "assessments": [
            {"type": "quiz", "prompt": "Conceptual question testing deep understanding", "answerKey": "Detailed 50-80 word answer with explanation"},
            {"type": "quiz", "prompt": "Computational/problem-solving question", "answerKey": "Step-by-step solution with reasoning"},
            {"type": "quiz", "prompt": "Application question with real-world context", "answerKey": "Comprehensive answer explaining how to apply concepts"},
            {"type": "quiz", "prompt": "Analysis question requiring critical thinking", "answerKey": "Detailed analytical answer"},
            {"type": "quiz", "prompt": "Synthesis question connecting multiple concepts", "answerKey": "Integrated answer showing connections"}
          ]
        },
        {
          "title": "Database Fundamentals",
          "summary": "...",
          "readings": [],
          "contentBlocks": [ /* same 6 blocks */ ],
          "assessments": [ /* 5 quizzes */ ]
        }
      ]
    },
    {
      "title": "Data Models and Design",
      "overview": "200-300 word overview",
      "learningObjectives": [...],
      "keyTerms": [...],
      "lessons": [ /* 2 lessons */ ]
    },
    {
      "title": "Database Management Systems",
      "overview": "200-300 word overview",
      "learningObjectives": [...],
      "keyTerms": [...],
      "lessons": [ /* 2 lessons */ ]
    },
    {
      "title": "Query Languages and SQL",
      "overview": "200-300 word overview",
      "learningObjectives": [...],
      "keyTerms": [...],
      "lessons": [ /* 2 lessons */ ]
    },
    {
      "title": "Advanced Topics",
      "overview": "200-300 word overview",
      "learningObjectives": [...],
      "keyTerms": [...],
      "lessons": [ /* 2 lessons */ ]
    },
    {
      "title": "Practical Applications",
      "overview": "200-300 word overview",
      "learningObjectives": [...],
      "keyTerms": [...],
      "lessons": [ /* 2 lessons */ ]
    }
  ]
}

CRITICAL: Your response MUST contain exactly 6 units in the units array. Each unit MUST have 2 lessons. Total: 12 lessons minimum.
VERIFY: Before returning, count the units array - it must have 6 elements!

Generate the complete JSON now with ALL 6 units fully populated.`;

  try {
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 16000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log(`✓ Generated ${responseText.length} characters`);

    // Clean response
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(jsonText);
    
    const generatedUnits = parsed.units?.length || 0;
    console.log(`✓ Generated ${generatedUnits} units`);
    
    // VALIDATION: Ensure minimum unit count
    if (generatedUnits < 6) {
      console.warn(`⚠️  Only ${generatedUnits} units generated (expected 6)`);
      console.warn('   AI did not follow instructions - this may result in limited content');
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
    
  } catch (error: any) {
    console.error('Generation failed:', error.message);
    throw error;
  }
}

