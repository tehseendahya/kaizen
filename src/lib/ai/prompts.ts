/**
 * AI Prompt Builders for Course Ingestion
 * These prompts are used to guide AI in organizing and enriching course content
 */

export interface FileSnippet {
  filename: string;
  content: string;
  section?: string;
}

export interface CourseMeta {
  code: string;
  title: string;
  description?: string;
}

/**
 * Build prompt for organizing course materials into curriculum structure
 */
export function buildOrganizerPrompt(
  courseMeta: CourseMeta,
  fileSnippets: FileSnippet[]
): string {
  const filesContext = fileSnippets
    .map((f) => `\n--- File: ${f.filename}${f.section ? ` (${f.section})` : ''} ---\n${f.content.slice(0, 5000)}`)
    .join('\n\n');

  return `You are organizing course materials into a strict JSON schema (CurriculumSchema). 

COURSE INFORMATION:
- Code: ${courseMeta.code}
- Title: ${courseMeta.title}
${courseMeta.description ? `- Description: ${courseMeta.description}` : ''}

COURSE MATERIALS:
${filesContext}

TASK:
Parse and cluster content into Units and Subunits as taught in a semester. Each subunit must have a distinct, student-friendly title that reflects the actual course structure.

REQUIREMENTS:
1. Output ONLY valid JSON that passes the CurriculumSchema validation
2. Keep index fields 0-based and contiguous within each unit
3. Units should represent major topics/modules (e.g., "Introduction to X", "Advanced Y")
4. Subunits should represent specific lessons/concepts within each unit
5. Maintain logical flow and progression through the course
6. Use clear, descriptive titles that students would recognize

OUTPUT FORMAT:
{
  "course": {
    "code": "${courseMeta.code}",
    "title": "${courseMeta.title}"
  },
  "units": [
    {
      "index": 0,
      "title": "Unit Title",
      "summary": "Brief overview",
      "subunits": [
        {
          "index": 0,
          "title": "Subunit Title",
          "raw_text": "Original content excerpt",
          "intuition": "",
          "worked_example": "",
          "pitfalls": "",
          "recap": "",
          "code_sketch": "",
          "references": ""
        }
      ]
    }
  ]
}

IMPORTANT: Output ONLY the JSON object, no markdown, no explanations, no code blocks.`;
}

/**
 * Build prompt for enriching a single subunit with detailed fields
 */
export function buildEnricherPrompt(
  subunitRaw: {
    title: string;
    raw_text?: string;
    unitTitle: string;
    courseCode: string;
  }
): string {
  return `Given this subunit's raw text and heading context, produce the following fields according to the SubunitSchema.

CONTEXT:
- Course: ${subunitRaw.courseCode}
- Unit: ${subunitRaw.unitTitle}
- Subunit: ${subunitRaw.title}

RAW CONTENT:
${subunitRaw.raw_text || 'No raw text provided'}

TASK:
Fill in the following fields with concise but complete information:

1. **intuition** (required): A clear, intuitive explanation of the core concept. Use analogies or real-world examples when helpful. 2-4 sentences.

2. **worked_example** (required): A fully solved example problem or demonstration. Show all steps clearly. If no example is appropriate, provide a concrete demonstration of the concept.

3. **pitfalls** (required): Common mistakes or misconceptions students encounter. List 2-4 specific pitfalls with brief explanations.

4. **recap** (required): A succinct summary (2-3 sentences) that reinforces key takeaways.

5. **code_sketch** (optional): If programming is relevant, provide a code example in TypeScript/JavaScript/Python. Otherwise, leave as empty string.

6. **references** (optional): Bulleted list of citations, related readings, or resources. If none, leave as empty string.

OUTPUT FORMAT (strict JSON):
{
  "intuition": "...",
  "worked_example": "...",
  "pitfalls": "...",
  "recap": "...",
  "code_sketch": "...",
  "references": "..."
}

IMPORTANT: 
- Output ONLY the JSON object, no markdown, no explanations, no code blocks
- All required fields must be non-empty strings
- Keep explanations concise but complete
- Ensure the JSON is valid and parseable`;

}

