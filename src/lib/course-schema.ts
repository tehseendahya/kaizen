/**
 * Standardized Course Schema
 * Single source of truth for course content structure
 * Used by both AI generation and rendering components
 */

export const StandardizedCourseSchema = {
  name: "CourseContentV1",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["courseMeta", "units"],
    properties: {
      courseMeta: {
        type: "object",
        additionalProperties: false,
        required: ["title", "code", "term", "description", "prerequisites"],
        properties: {
          title: { type: "string" },
          code: { type: "string" },
          term: { type: "string" },
          description: { type: "string" },
          prerequisites: { type: "array", items: { type: "string" } }
        }
      },
      units: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "overview", "lessons"],
          properties: {
            title: { type: "string" },
            overview: { type: "string" },
            learningObjectives: { type: "array", items: { type: "string" } },
            keyTerms: { type: "array", items: { type: "string" } },
            lessons: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "summary", "contentBlocks"],
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  readings: { type: "array", items: { type: "string" } },
                  contentBlocks: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["type", "body"],
                      properties: {
                        type: { type: "string", enum: ["note", "example", "derivation", "exercise", "faq"] },
                        body: { type: "string" }
                      }
                    }
                  },
                  assessments: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["type", "prompt"],
                      properties: {
                        type: { type: "string", enum: ["quiz", "problem", "project"] },
                        prompt: { type: "string" },
                        answerKey: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} as const;

export type CourseContentV1 = {
  courseMeta: {
    title: string;
    code: string;
    term: string;
    description: string;
    prerequisites: string[];
  };
  units: Array<{
    title: string;
    overview: string;
    learningObjectives?: string[];
    keyTerms?: string[];
    lessons: Array<{
      title: string;
      summary: string;
      readings?: string[];
      contentBlocks: Array<{
        type: "note" | "example" | "derivation" | "exercise" | "faq";
        body: string;
      }>;
      assessments?: Array<{
        type: "quiz" | "problem" | "project";
        prompt: string;
        answerKey?: string;
      }>;
    }>;
  }>;
};
