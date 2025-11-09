/**
 * Generate course draft using OpenAI with structured outputs
 * Strictly returns JSON matching StandardizedCourseSchema
 */

import OpenAI from 'openai';
import { StandardizedCourseSchema, CourseContentV1 } from '@/lib/course-schema';

// Rough token estimate: ~4 chars per token. Good enough to stay under limits.
function estimateTokens(str: string): number {
  return Math.ceil(str.length / 4);
}

// GPT-5 limits from my UI messaging
const MODEL_MAX_INPUT_TOKENS = 200_000;
const MODEL_MAX_OUTPUT_TOKENS = 32_000;

// Leave a little headroom
const INPUT_SAFETY_MARGIN = 4_000;

// We will never let (system + user prompt) exceed this estimate
const MAX_PROMPT_TOKENS = MODEL_MAX_INPUT_TOKENS - INPUT_SAFETY_MARGIN;

const SYSTEM_PROMPT = `You are an academic content architect specializing in converting course materials into structured educational content.

Your task is to:
1. Extract and organize course content from the provided materials
2. Create a well-structured course with units, lessons, and educational content
3. Ensure ALL fields are filled with meaningful content from the materials
4. Create at least 3-5 units if the materials support it
5. Each unit should have 2-4 lessons with detailed content blocks
6. Include learning objectives, key terms, examples, and exercises
7. Use ONLY information from the provided materials - do not invent facts

TYPICAL INPUT MATERIALS:
- You will usually receive:
  1) A course syllabus (overall description, learning outcomes, topic list, grading).
  2) A schedule or calendar (weeks/dates with topics, labs, and deadlines).
  3) Practice exams, homework sets, or course notes.
- Treat these three sources together as sufficient to design the course.
- Use the syllabus to define units and major topics.
- Use the schedule to order units and lessons over time.
- Use exams/assignments/notes to extract typical problems, examples, and quiz questions.

IMPORTANT BEHAVIOR:
- Never respond that the PDFs are "referenced but not included" if you see their text in the materials.
- Do NOT return custom error objects like {"error": "..."} or {"message": "..."}.
- Even if the materials feel brief, you must still output the best possible course JSON matching the schema.

LESSON STRUCTURE (CRITICAL):
Every lesson must follow this exact instructional path:

1. Key Concepts block (REQUIRED, first):
   - type: "note"
   - body: Start with "Key Concepts:" heading, then 3-7 bullet points summarizing core ideas
   - Example format: "Key Concepts:\\n- First key concept\\n- Second key concept\\n- ..."

2. Lecture - Conceptual Overview block (REQUIRED, second):
   - type: "note"
   - body: A clear, narrative explanation of the topic (2-4 paragraphs, lecture-style)
   - This should read like a written lecture, not bullet points

3. Lecture - Worked Walkthrough/Derivation block (REQUIRED, third):
   - type: "note" or "derivation"
   - body: Step-by-step reasoning, derivations, or a rich worked example
   - Connect back to concepts from the source material

4. Practice/Exercise block (OPTIONAL, encouraged):
   - type: "exercise"
   - body: Short list of practice prompts for students (e.g., "Sketch...", "Explain why...", "Compute...")
   - Only include if there is good material to extract

5. Assessments (REQUIRED):
   - Every lesson must have 3-4 quiz items in the assessments array
   - Each quiz must have: type: "quiz", prompt: "Question...", answerKey: "Answer..."
   - Questions must be concept-checking, tied directly to the lesson content
   - Mix conceptual and simple computational questions when source allows
   - Minimum 3 quizzes per lesson, aim for 4

IMPORTANT RULES:
- Every lesson MUST have at least three contentBlocks, in order: (1) Key Concepts, (2) Lecture – Conceptual Overview, (3) Lecture – Worked Walkthrough/Derivation
- Every lesson MUST have 3-4 quiz assessments in the assessments array, all of type "quiz"
- Every unit MUST have at least one lesson
- Content blocks should be substantial (not just a few words)
- Extract real examples, explanations, and concepts from the materials
- Organize content logically into units and lessons
- Do not invent facts - ground all content in provided materials`;

/**
 * Summarize each source file into a compact outline
 * This ALWAYS runs - we never send raw file text to the main course generation
 */
async function summarizeSources(
  client: OpenAI,
  modelName: string,
  parsed: Array<{ source: string; text: string }>
): Promise<Array<{ source: string; text: string }>> {
  const summaries: Array<{ source: string; text: string }> = [];

  // Cap how much raw text we ever send for a single file
  const MAX_CHARS_PER_SOURCE = 80_000; // ~20k tokens max per file
  const FALLBACK_SUMMARY_CHARS = 15_000; // Use this much raw text if summarization fails

  console.log('   📋 Summarizing', parsed.length, 'file(s)...');

  // Helper to extract text from various message shapes
  function extractMessageText(message: any): string {
    if (!message) return '';

    // 1) Plain string content
    if (typeof message.content === 'string') {
      return message.content;
    }

    // 2) Array content (multimodal style)
    if (Array.isArray(message.content)) {
      const parts = message.content
        .map((part: any) => {
          if (typeof part === 'string') return part;
          if (part?.text?.value) return part.text.value;
          if (typeof part?.text === 'string') return part.text;
          return '';
        })
        .filter(Boolean);
      if (parts.length) return parts.join('');
    }

    // 3) Refusal text, if present
    if (typeof message.refusal === 'string') {
      return message.refusal;
    }

    // 4) Last resort: stringify the whole message so we at least see something
    try {
      return JSON.stringify(message);
    } catch {
      return '';
    }
  }

  for (const item of parsed) {
    let text = item.text;
    if (text.length > MAX_CHARS_PER_SOURCE) {
      console.warn('[summarizeSources] Truncating very large source', {
        source: item.source,
        originalLength: text.length,
        truncatedLength: MAX_CHARS_PER_SOURCE,
      });
      text = text.slice(0, MAX_CHARS_PER_SOURCE);
    }

    const fileName = item.source.split('/').pop() || item.source;

    try {
      const summaryPrompt = `
You are helping prepare course generation for a university class.

The source you see may be one of:
- A course syllabus
- A schedule/calendar
- A practice exam, homework, or course notes

Summarize the source into a compact, structured outline that captures:
- If it looks like a SYLLABUS:
  - Course description and goals
  - Learning outcomes
  - Major topics/units
  - Assessment types and weights
- If it looks like a SCHEDULE:
  - Week-by-week or date-by-date topics
  - Associated labs, recitations, and assessments
  - Milestones and major exams
- If it looks like EXAMS / ASSIGNMENTS / NOTES:
  - Types of problems and skills being tested
  - Key concepts, formulas, and methods that recur
  - Any patterns in difficulty or emphasis

Focus on pedagogically important information.
Do NOT invent new topics; only compress what is present.
Aim for about 1000–1500 tokens of output.

SOURCE (${item.source}):
${text}
`;

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: 'You are an expert academic summarizer.' },
          { role: 'user', content: summaryPrompt },
        ],
        max_completion_tokens: 2000,
        temperature: 1,
      });

      const msg = completion.choices[0]?.message;
      const content = extractMessageText(msg);

      console.log('[summarizeSources] Model summary result', {
        source: item.source,
        inputChars: text.length,
        outputChars: content.length,
        contentPreview: content.slice(0, 200),
      });

      if (!content || !content.trim()) {
        console.error('[summarizeSources] EMPTY SUMMARY from model', {
          source: item.source,
          inputChars: text.length,
          rawMessage: msg,
          usage: completion.usage,
        });
        console.warn(
          '[summarizeSources] Summary empty, using truncated raw text as fallback',
          { source: item.source, fallbackLength: FALLBACK_SUMMARY_CHARS }
        );
        console.log('      ⚠️', fileName, ':', text.length, 'chars → FALLBACK (', FALLBACK_SUMMARY_CHARS, 'chars)');
        summaries.push({
          source: item.source,
          text: text.slice(0, FALLBACK_SUMMARY_CHARS),
        });
      } else {
        console.log('      ✓', fileName, ':', text.length, 'chars →', content.length, 'chars');
        summaries.push({
          source: item.source,
          text: content,
        });
      }
    } catch (err) {
      console.error('[summarizeSources] Error summarizing source, using fallback', {
        source: item.source,
        error: (err as Error).message,
      });
      console.log('      ⚠️', fileName, ':', text.length, 'chars → FALLBACK (error:', (err as Error).message, ')');
      summaries.push({
        source: item.source,
        text: text.slice(0, FALLBACK_SUMMARY_CHARS),
      });
    }
  }

  console.log('   ✅ All sources summarized successfully (', summaries.length, 'summaries )\n');
  return summaries;
}

// Helper to extract text content from various OpenAI message shapes
function extractMessageContent(message: any): string {
  if (!message) return '';

  // 1) Plain string content
  if (typeof message.content === 'string') {
    return message.content;
  }

  // 2) Array-of-parts content (multimodal style)
  if (Array.isArray(message.content)) {
    const parts = message.content
      .map((part: any) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        if (part?.text?.value) return part.text.value;
        return '';
      })
      .filter(Boolean);
    if (parts.length) return parts.join('');
  }

  // 3) Refusal text, if present
  if (typeof (message as any).refusal === 'string') {
    return (message as any).refusal;
  }

  return '';
}

export async function generateCourseDraft(
  seedMeta: { 
    title: string; 
    code?: string; 
    term?: string; 
    description?: string;
  },
  parsed: Array<{ source: string; text: string }>
): Promise<CourseContentV1> {
  console.log('\n🎬 [AI] STARTING COURSE GENERATION');
  console.log('[generateCourseDraft] START', {
    title: seedMeta.title,
    sourceCount: parsed.length,
  });

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const client = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });

  const modelName = process.env.OPENAI_MODEL || 'gpt-5';
  let maxTokens = 12_000; // default

  console.log('\n📝 [AI] STAGE 1: Summarizing sources');
  console.log('   → Files to summarize:', parsed.length);

  // NEW: summarize each source first (ALWAYS)
  const summarized = await summarizeSources(client, modelName, parsed);
  
  console.log('[generateCourseDraft] Stage 1 complete: summaries ready', {
    summarizedSources: summarized.length,
  });

  const bundle = summarized
    .map(p => `### SOURCE: ${p.source}\n${p.text}`)
    .join('\n\n---\n\n');

  const bundleTokens = estimateTokens(bundle);
  console.log('\n🔨 [AI] STAGE 2: Building prompt');
  console.log('[generateCourseDraft] Stage 2: built bundle', {
    bundleChars: bundle.length,
    bundleTokensEstimate: bundleTokens,
  });
  console.log('   → Bundle size:', bundleTokens, 'tokens (~' + Math.round(bundleTokens / 1000) + 'k)');

  let userPrompt = `Create a comprehensive structured course from the following materials.

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
4. For each lesson, create content blocks following this exact structure:
   
   REQUIRED CONTENT BLOCKS (in this order):
   a. Key Concepts block:
      - type: "note"
      - body: Start with "Key Concepts:" then list 3-7 bullet points of core ideas
   
   b. Lecture - Conceptual Overview block:
      - type: "note"
      - body: 2-4 paragraph narrative explanation (lecture-style, not bullets)
   
   c. Lecture - Worked Walkthrough/Derivation block:
      - type: "note" or "derivation"
      - body: Step-by-step reasoning, derivations, or rich worked example
   
   d. Practice/Exercise block (optional, but encouraged):
      - type: "exercise"
      - body: List of practice prompts for students

5. For each lesson, create 3-4 quiz assessments:
   - Each quiz: type "quiz", clear prompt, answer key
   - Mix conceptual and computational questions
   - Ground questions in the lesson content

6. Include learning objectives for each unit
7. Extract key terms and vocabulary

8. Assume the course materials typically consist of:
   - A syllabus: use this to identify units, main topics, and learning objectives.
   - A schedule/calendar: use this to order units and lessons in time (weeks, lectures, labs).
   - Practice exams / assignments / notes: mine these for representative examples, problem types, and quiz questions.

CRITICAL REQUIREMENTS:
- Each lesson must have a Key Concepts content block FIRST, containing 3-7 bullet points
- Each lesson must then have TWO lecture-style content blocks with detailed explanations and/or derivations
- Each lesson must include 3-4 quiz assessments (type "quiz") with clear prompts and answer keys
- Generate AT LEAST 3 units (more if the materials are extensive)
- Each unit MUST have at least 2 lessons
- Each lesson MUST have at least three content blocks (Key Concepts + two lecture blocks)
- Extract real examples, explanations, and exercises from the materials
- Make content blocks detailed and informative (not just titles)
- Include a mix of note, example, derivation, and exercise content blocks
- Do NOT return error payloads like {"error": "..."} or {"message": "..."}.
- Always return a valid course JSON object matching the schema, even if the materials seem short. If content is limited, create fewer units/lessons but still follow the required structure.

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
              "body": "Key Concepts:\\n- First concept\\n- Second concept\\n- Third concept"
            },
            {
              "type": "note",
              "body": "Detailed conceptual explanation here... This is the lecture-style overview that explains the topic in 2-4 paragraphs."
            },
            {
              "type": "derivation",
              "body": "Step-by-step walkthrough or worked example here..."
            }
          ],
          "assessments": [
            {
              "type": "quiz",
              "prompt": "Conceptual question here...",
              "answerKey": "Answer here..."
            },
            {
              "type": "quiz",
              "prompt": "Computational question here...",
              "answerKey": "Answer here..."
            },
            {
              "type": "quiz",
              "prompt": "Application question here...",
              "answerKey": "Answer here..."
            }
          ]
        }
      ]
    }
  ]
}`;

  // Add a final safety clamp on the whole prompt
  let systemTokens = estimateTokens(SYSTEM_PROMPT);
  let promptTokens = estimateTokens(userPrompt);

  // If prompt is still too big, iteratively shrink the materials section
  if (systemTokens + promptTokens > MAX_PROMPT_TOKENS) {
    console.warn('[generateCourseDraft] Prompt too large, trimming bundle', {
      systemTokens,
      promptTokens,
      MAX_PROMPT_TOKENS,
    });

    // Find where "Course Materials:" starts so we only cut the materials portion
    const marker = 'Course Materials:';
    const idx = userPrompt.indexOf(marker);

    if (idx !== -1) {
      const prefix = userPrompt.slice(0, idx + marker.length);
      let materials = userPrompt.slice(idx + marker.length);

      // Iteratively shrink materials until total fits
      const MIN_MATERIAL_CHARS = 10_000; // don't go below this, just in case

      while (
        systemTokens + promptTokens > MAX_PROMPT_TOKENS &&
        materials.length > MIN_MATERIAL_CHARS
      ) {
        // remove 20% and re-estimate
        materials = materials.slice(0, Math.floor(materials.length * 0.8));

        const newUserPrompt = prefix + materials;
        promptTokens = estimateTokens(newUserPrompt);
        userPrompt = newUserPrompt;
      }

      console.log('[generateCourseDraft] Final prompt token estimate', {
        totalTokens: systemTokens + promptTokens,
        MAX_PROMPT_TOKENS,
      });
    }
  } else {
    console.log('[generateCourseDraft] Prompt fits within limits', {
      totalTokens: systemTokens + promptTokens,
      MAX_PROMPT_TOKENS,
    });
  }

  try {
    // Clamp output tokens
    if (maxTokens > MODEL_MAX_OUTPUT_TOKENS) {
      maxTokens = MODEL_MAX_OUTPUT_TOKENS;
    }

    console.log('\n🤖 [AI] STAGE 3: Calling OpenAI');
    console.log('[generateCourseDraft] Stage 3: calling course model', {
      modelName,
      promptTokensEstimate: systemTokens + promptTokens,
      maxCompletionTokens: maxTokens,
    });
    console.log('   → Model:', modelName);
    console.log('   → Input tokens:', systemTokens + promptTokens, '(~' + Math.round((systemTokens + promptTokens) / 1000) + 'k)');
    console.log('   → Max completion tokens:', maxTokens, '(~' + Math.round(maxTokens / 1000) + 'k)');
    console.log('   → Waiting for response...');
    
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
      max_completion_tokens: maxTokens,
    });

    console.log('[generateCourseDraft] OpenAI raw completion meta', {
      id: completion.id,
      created: completion.created,
      model: completion.model,
      choicesCount: completion.choices?.length ?? 0,
      usage: completion.usage,
    });

    if (!completion.choices || completion.choices.length === 0) {
      console.error('[generateCourseDraft] OpenAI returned zero choices', completion);
      throw new Error(
        'OpenAI returned zero choices for course generation. Check model, request payload, or service status.'
      );
    }

    const message = completion.choices[0].message;
    const rawMessage = message;
    const responseContent = extractMessageContent(rawMessage);

    console.log('[generateCourseDraft] Primary message from model', {
      hasContent: !!responseContent,
      contentPreview: responseContent ? responseContent.slice(0, 300) : null,
      rawMessage,
    });

    if (!responseContent || !responseContent.trim()) {
      console.error('[generateCourseDraft] Model message has no usable content', {
        rawMessage,
      });
      throw new Error(
        'OpenAI returned a completion without usable content for course generation. See server logs for raw message.'
      );
    }

    console.log('\n📥 [AI] Received response from OpenAI');
    console.log('[generateCourseDraft] Stage 4: raw model response preview', {
      preview: responseContent.slice(0, 400),
    });
    console.log('   → Response length:', responseContent.length, 'characters');
    console.log('   → Preview:', responseContent.slice(0, 200) + '...');

    try {
      const parsedContent = JSON.parse(responseContent);
      
      // First, detect the error pattern
      if (parsedContent && typeof parsedContent === 'object' && parsedContent.error) {
        console.error('[generateCourseDraft] Model reported error payload', parsedContent);
        throw new Error(
          `AI course generation failed: ${parsedContent.error}${
            parsedContent.message ? ' - ' + parsedContent.message : ''
          }`
        );
      }
      
      console.log('[generateCourseDraft] Parsed AI response:', {
        hasCourseMeta: !!parsedContent.courseMeta,
        unitsCount: parsedContent.units?.length || 0,
        totalLessons: parsedContent.units?.reduce((sum: number, u: any) => sum + (u.lessons?.length || 0), 0) || 0
      });
      
      // Validate the structure matches our schema
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

      if (validated.units.length === 0) {
        console.warn('[generateCourseDraft] WARNING: AI generated 0 units.');
        throw new Error('AI generated course has no units. The source materials may be too brief.');
      }

      // Validate units
      validated.units = validated.units.map((unit: any, unitIdx: number) => {
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
            const contentBlocks = Array.isArray(lesson.contentBlocks) ? lesson.contentBlocks : [];
            
            // Validate lesson structure
            if (contentBlocks.length < 3) {
              console.warn(`[generateCourseDraft] STRUCTURE WARNING: Lesson "${lesson.title || 'Untitled'}" (Unit ${unitIdx + 1}.${lessonIdx + 1}) has only ${contentBlocks.length} content blocks. Expected at least 3.`);
            }

            const firstBlock = contentBlocks[0];
            if (firstBlock && firstBlock.type === 'note' && !firstBlock.body?.includes('Key Concepts')) {
              console.warn(`[generateCourseDraft] STRUCTURE WARNING: Lesson "${lesson.title || 'Untitled'}" - first block doesn't appear to be Key Concepts format.`);
            }

            const assessments = Array.isArray(lesson.assessments) ? lesson.assessments : [];
            const quizCount = assessments.filter((a: any) => a.type === 'quiz').length;
            if (quizCount < 3) {
              console.warn(`[generateCourseDraft] STRUCTURE WARNING: Lesson "${lesson.title || 'Untitled'}" has only ${quizCount} quiz assessments. Expected 3-4.`);
            }

            return {
              title: lesson.title || `Lesson ${lessonIdx + 1}`,
              summary: lesson.summary || 'Lesson summary',
              readings: Array.isArray(lesson.readings) ? lesson.readings : [],
              contentBlocks: contentBlocks.map((block: any) => {
                const body = block.body || '';
                if (body.trim().length < 10) {
                  console.warn(`[generateCourseDraft] WARNING: Content block has very short body in lesson "${lesson.title}"`);
                }
                return {
                  type: ['note', 'example', 'derivation', 'exercise', 'faq'].includes(block.type) 
                    ? block.type 
                    : 'note',
                  body: body || 'Content not available'
                };
              }),
              assessments: assessments.map((a: any) => ({
                type: a.type || 'quiz',
                prompt: a.prompt || '',
                answerKey: a.answerKey || ''
              }))
            };
          })
        };
      });

      const totalContentBlocks = validated.units.reduce((sum, unit) => 
        sum + unit.lessons.reduce((lessonSum, lesson) => 
          lessonSum + lesson.contentBlocks.length, 0), 0
      );

      if (totalContentBlocks === 0) {
        throw new Error('AI generated course has no content blocks.');
      }

      console.log('\n✨ [AI] Successfully validated course structure');
      console.log('   → Units:', validated.units.length);
      console.log('   → Total lessons:', validated.units.reduce((sum, u) => sum + u.lessons.length, 0));
      console.log('   → Total content blocks:', totalContentBlocks);

      return validated;
    } catch (e: any) {
      console.error('[generateCourseDraft.parse-json]', {
        message: e?.message || 'Failed to parse JSON',
        textPreview: responseContent ? responseContent.slice(0, 500) : 'No content',
      });
      throw new Error('Model returned invalid JSON for the schema');
    }
  } catch (error: any) {
    const errorDetails: any = {
      message: error?.message || 'Unknown OpenAI error',
      name: error?.name || 'Error',
    };
    
    if (typeof error?.message === 'string') {
      errorDetails.modelMessage = error.message;
    }
    
    if (error?.response) {
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      if (error.response.data) {
        errorDetails.apiError = error.response.data.error;
      }
    }
    
    if (error?.stack) errorDetails.stack = error.stack;
    
    console.error('[generateCourseDraft.openai-error]', errorDetails);
    
    const errorMessage = error?.message || '';
    
    // Check if the error is due to no usable content - try fallback without response_format
    if (errorMessage.includes('completion without usable content')) {
      console.warn('[generateCourseDraft] Retrying course generation WITHOUT response_format');

      try {
        const completionFallback = await client.chat.completions.create({
          model: modelName,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          // NOTE: no response_format here
          temperature: 1,
          max_completion_tokens: maxTokens,
        });

        console.log('[generateCourseDraft] Fallback completion meta', {
          id: completionFallback.id,
          choicesCount: completionFallback.choices?.length ?? 0,
          usage: completionFallback.usage,
        });

        if (!completionFallback.choices || completionFallback.choices.length === 0) {
          console.error('[generateCourseDraft] Fallback also returned zero choices', completionFallback);
          throw new Error('OpenAI fallback (no response_format) also returned no choices.');
        }

        const fallbackMessage = completionFallback.choices[0].message;
        const fallbackText = extractMessageContent(fallbackMessage);

        console.log('[generateCourseDraft] Fallback raw text preview', {
          preview: fallbackText.slice(0, 300),
        });

        if (!fallbackText || !fallbackText.trim()) {
          throw new Error('Fallback completion also returned no usable content');
        }

        // Parse and validate the fallback response
        const parsedFallback = JSON.parse(fallbackText);

        // Detect error pattern
        if (parsedFallback && typeof parsedFallback === 'object' && parsedFallback.error) {
          console.error('[generateCourseDraft] Fallback model reported error payload', parsedFallback);
          throw new Error(
            `AI course generation failed: ${parsedFallback.error}${
              parsedFallback.message ? ' - ' + parsedFallback.message : ''
            }`
          );
        }

        // Validate using the same logic as before
        const validated: CourseContentV1 = {
          courseMeta: {
            title: parsedFallback.courseMeta?.title || seedMeta.title || 'Untitled Course',
            code: parsedFallback.courseMeta?.code || seedMeta.code || 'COURSE',
            term: parsedFallback.courseMeta?.term || seedMeta.term || '',
            description: parsedFallback.courseMeta?.description || seedMeta.description || 'Course description',
            prerequisites: Array.isArray(parsedFallback.courseMeta?.prerequisites) 
              ? parsedFallback.courseMeta.prerequisites 
              : []
          },
          units: Array.isArray(parsedFallback.units) ? parsedFallback.units : []
        };

        if (validated.units.length === 0) {
          throw new Error('Fallback: AI generated course has no units.');
        }

        // Simplified validation for fallback
        validated.units = validated.units.map((unit: any, unitIdx: number) => {
          const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
          return {
            title: unit.title || `Unit ${unitIdx + 1}`,
            overview: unit.overview || 'Unit overview',
            learningObjectives: Array.isArray(unit.learningObjectives) ? unit.learningObjectives : [],
            keyTerms: Array.isArray(unit.keyTerms) ? unit.keyTerms : [],
            lessons: lessons.map((lesson: any, lessonIdx: number) => {
              const contentBlocks = Array.isArray(lesson.contentBlocks) ? lesson.contentBlocks : [];
              const assessments = Array.isArray(lesson.assessments) ? lesson.assessments : [];
              
              return {
                title: lesson.title || `Lesson ${lessonIdx + 1}`,
                summary: lesson.summary || 'Lesson summary',
                readings: Array.isArray(lesson.readings) ? lesson.readings : [],
                contentBlocks: contentBlocks.map((block: any) => ({
                  type: ['note', 'example', 'derivation', 'exercise', 'faq'].includes(block.type) 
                    ? block.type 
                    : 'note',
                  body: block.body || 'Content not available'
                })),
                assessments: assessments.map((a: any) => ({
                  type: a.type || 'quiz',
                  prompt: a.prompt || '',
                  answerKey: a.answerKey || ''
                }))
              };
            })
          };
        });

        console.log('\n✅ [AI] Fallback succeeded - course generated without response_format');
        console.log('   → Units:', validated.units.length);
        console.log('   → Total lessons:', validated.units.reduce((sum, u) => sum + u.lessons.length, 0));

        return validated;
      } catch (fallbackError: any) {
        console.error('[generateCourseDraft] Fallback also failed', {
          message: fallbackError?.message || 'Unknown error',
          stack: fallbackError?.stack,
        });
        throw new Error(
          `Course generation failed even with fallback: ${fallbackError?.message || 'Unknown error'}`
        );
      }
    }
    
    if (errorMessage.includes('does not exist') || errorMessage.includes('404') || errorMessage.includes('not found')) {
      const currentModel = process.env.OPENAI_MODEL || 'gpt-5';
      throw new Error(
        `Model "${currentModel}" is not available or you don't have access to it. ` +
        `Ensure your OpenAI account has access to GPT-5. ` +
        `Check your API key and model access at https://platform.openai.com/settings/organization/limits`
      );
    }
    
    if (errorMessage.includes('max_tokens') || errorMessage.includes('too large') || errorMessage.includes('completion tokens')) {
      const currentModel = process.env.OPENAI_MODEL || 'gpt-5';
      throw new Error(
        `Token limit exceeded for model "${currentModel}" even after automatic compression and trimming. ` +
        `This should not happen. Please try uploading fewer or smaller files. ` +
        `GPT-5 supports up to 200k input tokens and 32k output tokens per request.`
      );
    }
    
    throw error;
  }
}
