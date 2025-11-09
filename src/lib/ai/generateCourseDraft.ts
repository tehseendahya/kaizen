/**
 * Generate course draft using OpenAI with structured outputs
 * Strictly returns JSON matching StandardizedCourseSchema
 */

import OpenAI from 'openai';
import { StandardizedCourseSchema, CourseContentV1 } from '@/lib/course-schema';

const SYSTEM_PROMPT = `You are an academic content architect specializing in converting course materials into structured educational content.

Your task is to:
1. Extract and organize course content from the provided materials
2. Create a well-structured course with units, lessons, and educational content
3. Ensure ALL fields are filled with meaningful content from the materials
4. Create at least 3-5 units if the materials support it
5. Each unit should have 2-4 lessons with detailed content blocks
6. Include learning objectives, key terms, examples, and exercises
7. Use ONLY information from the provided materials - do not invent facts

IMPORTANT:
- Every unit MUST have at least one lesson
- Every lesson MUST have at least one content block
- Content blocks should be substantial (not just a few words)
- Extract real examples, explanations, and concepts from the materials
- Organize content logically into units and lessons
- Include assessments (quizzes/problems) where appropriate`;

export async function generateCourseDraft(
  seedMeta: { 
    title: string; 
    code?: string; 
    term?: string; 
    description?: string;
  },
  parsed: Array<{ source: string; text: string }>
): Promise<CourseContentV1> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const client = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });

  // Bundle all parsed text with source labels
  const bundle = parsed
    .map(p => `### SOURCE: ${p.source}\n${p.text}`)
    .join('\n\n---\n\n');

  const userPrompt = `Create a comprehensive structured course from the following materials.

Course Information:
- Title: ${seedMeta.title}
- Code: ${seedMeta.code || 'Not specified'}
- Term: ${seedMeta.term || 'Not specified'}
- Description: ${seedMeta.description || 'Extract from materials'}

Course Materials:
${bundle}

Instructions:
1. Analyze the materials and identify the main topics/themes
2. Organize these into 3-5 logical units (each unit covering a major topic)
3. Break each unit into 2-4 lessons (each lesson covering a specific concept)
4. For each lesson, extract:
   - Clear explanations and notes
   - Worked examples from the materials
   - Key concepts and definitions
   - Practice exercises or problems
   - Reading assignments if mentioned
5. Include learning objectives for each unit
6. Extract key terms and vocabulary
7. Create assessments (quizzes/problems) based on the content

CRITICAL REQUIREMENTS:
- Generate AT LEAST 3 units (more if the materials are extensive)
- Each unit MUST have at least 2 lessons
- Each lesson MUST have multiple content blocks with substantial content
- Extract real examples, explanations, and exercises from the materials
- Make content blocks detailed and informative (not just titles)
- Include a mix of note, example, and exercise content blocks

Return ONLY valid JSON matching this exact structure:
{
  "courseMeta": {
    "title": "...",
    "code": "...",
    "term": "...",
    "description": "...",
    "prerequisites": []
  },
  "units": [
    {
      "title": "Unit Title",
      "overview": "Unit overview description",
      "learningObjectives": ["objective 1", "objective 2"],
      "keyTerms": ["term1", "term2"],
      "lessons": [
        {
          "title": "Lesson Title",
          "summary": "Lesson summary",
          "readings": ["reading 1"],
          "contentBlocks": [
            {
              "type": "note",
              "body": "Detailed content here..."
            },
            {
              "type": "example",
              "body": "Example content here..."
            }
          ],
          "assessments": [
            {
              "type": "quiz",
              "prompt": "Question here...",
              "answerKey": "Answer here..."
            }
          ]
        }
      ]
    }
  ]
}`;

  try {
    // Using the chat completions API with response_format
    // Model can be overridden via OPENAI_MODEL environment variable
    // Default to gpt-4-turbo-preview for best quality (was gpt-3.5-turbo)
    // Options: 'gpt-4-turbo-preview' (recommended), 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'
    const modelName = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    
    // Set max_tokens based on model limits
    // gpt-3.5-turbo: 4096 completion tokens max
    // gpt-4-turbo-preview: 4096 completion tokens max (128k context)
    // gpt-4o: 4096 completion tokens max (128k context)
    // gpt-4: 8192 completion tokens max (8k context)
    // For course generation, we need substantial output - use higher limits
    let maxTokens = 8000; // Increased for better course quality
    
    // Log model being used for debugging
    console.log(`[AI] Using model: ${modelName} with max_tokens: ${maxTokens}`);
    
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4, // Slightly higher for more creative/detailed content
      max_tokens: maxTokens, // Increased for comprehensive courses
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response content from OpenAI');
    }

    try {
      const parsedContent = JSON.parse(responseContent);
      
      console.log('[generateCourseDraft] Parsed AI response:', {
        hasCourseMeta: !!parsedContent.courseMeta,
        unitsCount: parsedContent.units?.length || 0,
        totalLessons: parsedContent.units?.reduce((sum: number, u: any) => sum + (u.lessons?.length || 0), 0) || 0
      });
      
      // Validate the structure matches our schema
      // Fill in any missing required fields with defaults
      const validated: CourseContentV1 = {
        courseMeta: {
          title: parsedContent.courseMeta?.title || seedMeta.title || 'Untitled Course',
          code: parsedContent.courseMeta?.code || seedMeta.code || 'COURSE',
          term: parsedContent.courseMeta?.term || seedMeta.term || '',
          description: parsedContent.courseMeta?.description || seedMeta.description || 'Course description',
          prerequisites: Array.isArray(parsedContent.courseMeta?.prerequisites) 
            ? parsedContent.courseMeta.prerequisites 
            : []
        },
        units: Array.isArray(parsedContent.units) ? parsedContent.units : []
      };

      // Validate and ensure units have required fields with meaningful content
      if (validated.units.length === 0) {
        console.warn('[generateCourseDraft] WARNING: AI generated 0 units. This may indicate insufficient source material or prompt issues.');
        throw new Error('AI generated course has no units. The source materials may be too brief or the prompt needs adjustment.');
      }

      // Ensure units have required fields and validate content
      validated.units = validated.units.map((unit: any, unitIdx: number) => {
        // Validate unit has lessons
        const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
        if (lessons.length === 0) {
          console.warn(`[generateCourseDraft] WARNING: Unit ${unitIdx + 1} has no lessons`);
        }

        return {
          title: unit.title || `Unit ${unitIdx + 1}`,
          overview: unit.overview || 'Unit overview',
          learningObjectives: Array.isArray(unit.learningObjectives) ? unit.learningObjectives : [],
          keyTerms: Array.isArray(unit.keyTerms) ? unit.keyTerms : [],
          lessons: lessons.map((lesson: any, lessonIdx: number) => {
            // Validate lesson has content blocks
            const contentBlocks = Array.isArray(lesson.contentBlocks) ? lesson.contentBlocks : [];
            if (contentBlocks.length === 0) {
              console.warn(`[generateCourseDraft] WARNING: Lesson ${unitIdx + 1}.${lessonIdx + 1} has no content blocks`);
            }

            return {
              title: lesson.title || `Lesson ${lessonIdx + 1}`,
              summary: lesson.summary || 'Lesson summary',
              readings: Array.isArray(lesson.readings) ? lesson.readings : [],
              contentBlocks: contentBlocks.map((block: any) => {
                // Ensure content blocks have substantial content
                const body = block.body || '';
                if (body.trim().length < 10) {
                  console.warn(`[generateCourseDraft] WARNING: Content block has very short body (${body.length} chars)`);
                }
                return {
                  type: ['note', 'example', 'derivation', 'exercise', 'faq'].includes(block.type) 
                    ? block.type 
                    : 'note',
                  body: body || 'Content not available'
                };
              }),
              assessments: Array.isArray(lesson.assessments) ? lesson.assessments : []
            };
          })
        };
      });

      // Final validation - ensure we have meaningful content
      const totalContentBlocks = validated.units.reduce((sum, unit) => 
        sum + unit.lessons.reduce((lessonSum, lesson) => 
          lessonSum + lesson.contentBlocks.length, 0), 0
      );

      if (totalContentBlocks === 0) {
        console.error('[generateCourseDraft] ERROR: Generated course has no content blocks');
        throw new Error('AI generated course has no content blocks. The source materials may not contain extractable content.');
      }

      console.log('[generateCourseDraft] Successfully validated course:', {
        units: validated.units.length,
        totalLessons: validated.units.reduce((sum, u) => sum + u.lessons.length, 0),
        totalContentBlocks
      });

      return validated;
    } catch (e: any) {
      const errorDetails = {
        message: e?.message || 'Failed to parse JSON',
        textPreview: responseContent ? responseContent.slice(0, 500) : 'No content',
      };
      console.error('[generateCourseDraft.parse-json]', errorDetails);
      throw new Error('Model returned invalid JSON for the schema');
    }
  } catch (error: any) {
    // Extract error details
    const errorDetails: any = {
      message: error?.message || 'Unknown OpenAI error',
      name: error?.name || 'Error',
    };
    
    // OpenAI specific error properties
    if (error?.response) {
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      if (error.response.data) {
        errorDetails.apiError = error.response.data.error;
      }
    }
    
    if (error?.stack) errorDetails.stack = error.stack;
    
    console.error('[generateCourseDraft.openai-error]', errorDetails);
    
    // Check for specific error types and provide helpful messages
    const errorMessage = error?.message || '';
    
    // Model not found error
    if (errorMessage.includes('does not exist') || errorMessage.includes('404') || errorMessage.includes('not found')) {
      const currentModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      throw new Error(
        `Model "${currentModel}" is not available or you don't have access to it. ` +
        `Please set OPENAI_MODEL=gpt-3.5-turbo in your .env.local file, or ensure your OpenAI account has access to the requested model. ` +
        `If you need GPT-4 access, verify your OpenAI account has been approved for GPT-4 usage at https://platform.openai.com/usage`
      );
    }
    
    // Token limit error
    if (errorMessage.includes('max_tokens') || errorMessage.includes('too large') || errorMessage.includes('completion tokens')) {
      const currentModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      throw new Error(
        `Token limit exceeded for model "${currentModel}". ` +
        `The course content is too large to generate in a single request. ` +
        `Try reducing the amount of source material or use a model with higher token limits. ` +
        `Current limit: 4000 tokens. Consider using GPT-4 models if you need more capacity.`
      );
    }
    
    throw error;
  }
}
