/**
 * Convert CourseContentV1 format to unified frontmatter format
 * This bridges the old AI-generated format with the new template system
 */

import type { CourseContentV1 } from "@/lib/course-schema";
import type { Course } from "@/lib/courses/unified-loader";
import { aiToFrontmatter } from "./aiToFrontmatter";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function courseContentV1ToUnified(
  v1Content: CourseContentV1,
  courseId: string
): Course {
  // Aggressively filter out placeholder comments and markdown structure
  const cleanText = (text: string) => {
    if (!text) return "";
    
    let cleaned = text
      // Remove HTML comments first
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove markdown headers (###, ##, #)
      .replace(/^#{1,6}\s+/gm, "")
      // Remove LATER/TODO/TBD markers
      .replace(/LATER:[\s\S]*?(?=\n\n|\n#|$)/gi, "")
      .replace(/TODO[\s\S]*?(?=\n\n|\n#|$)/gi, "")
      .replace(/TBD[\s\S]*?(?=\n\n|\n#|$)/gi, "")
      // Remove common placeholder patterns
      .replace(/\(\s*TBD\s*\)/gi, "")
      .replace(/\[\s*TBD\s*\]/gi, "")
      // Remove lines that are just dashes or placeholders
      .replace(/^[-•*]\s*<--.*?-->\s*$/gm, "")
      .replace(/^[-•*]\s*TBD\s*$/gm, "")
      .replace(/^[-•*]\s*TODO\s*$/gm, "")
      // Remove empty bullet points
      .replace(/^[-•*]\s*$/gm, "")
      // Clean up multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    
    // Split into lines and remove lines that are just structural/placeholder
    const lines = cleaned.split("\n").filter(line => {
      const trimmed = line.trim();
      // Remove lines that are section headers without content
      if (trimmed.match(/^(Overview|Learning Objectives|Key Concepts|Quick Review|Practice|Example|Note):?\s*$/i)) {
        return false;
      }
      // Remove empty lines at this stage
      if (!trimmed) return false;
      return true;
    });
    
    return lines.join("\n").trim();
  };

  // Convert CourseContentV1 structure to the format expected by aiToFrontmatter
  const converted = {
    id: courseId,
    title: v1Content.courseMeta.title,
    description: v1Content.courseMeta.description,
    units: v1Content.units.map((unit, unitIndex) => {
      // Convert lessons to sections
      const sections = unit.lessons.map((lesson, lessonIndex) => {
        // Extract note and example from contentBlocks
        const noteBlock = lesson.contentBlocks?.find((cb) => cb.type === "note");
        const exampleBlock = lesson.contentBlocks?.find(
          (cb) => cb.type === "example"
        );
        const otherBlocks = lesson.contentBlocks?.filter(
          (cb) => cb.type !== "note" && cb.type !== "example"
        ) || [];

        // Combine content blocks into intro - prioritize summary, then other blocks
        const introParts: string[] = [];
        
        // Start with summary if available
        if (lesson.summary) {
          const cleaned = cleanText(lesson.summary);
          if (cleaned) introParts.push(cleaned);
        }
        
        // Add other content blocks (derivation, exercise, faq)
        if (otherBlocks.length > 0) {
          otherBlocks.forEach((cb) => {
            if (cb.body && cb.body.trim()) {
              const cleaned = cleanText(cb.body);
              if (cleaned) {
                const typeLabel = cb.type.charAt(0).toUpperCase() + cb.type.slice(1);
                introParts.push(`**${typeLabel}**: ${cleaned}`);
              }
            }
          });
        }
        
        // If no intro yet, use note block as intro
        if (introParts.length === 0 && noteBlock?.body) {
          const cleaned = cleanText(noteBlock.body);
          if (cleaned) introParts.push(cleaned);
        }

        return {
          id: `${unitIndex + 1}.${lessonIndex + 1}`,
          slug: slugify(lesson.title),
          title: lesson.title,
          intro: introParts.filter(Boolean).join("\n\n") || "",
          readings: lesson.readings?.map((r) => ({
            title: typeof r === "string" ? r : r.title || "",
            href: typeof r === "string" ? undefined : r.href,
          })) || [],
          note: cleanText(noteBlock?.body || ""),
          example: cleanText(exampleBlock?.body || ""),
          assessments:
            lesson.assessments?.map((a, i) => ({
              id: `${slugify(lesson.title)}-q${i + 1}`,
              prompt: a.prompt,
              answer: a.answerKey,
              type:
                a.type === "quiz"
                  ? "mcq"
                  : a.type === "problem"
                  ? "calc"
                  : "short",
            })) || [],
        };
      });

      return {
        number: unitIndex + 1,
        title: unit.title,
        summary: unit.overview,
        learningObjectives: unit.learningObjectives || [],
        keyTerms: unit.keyTerms || [],
        sections,
      };
    }),
    // Create lessons metadata from all lessons
    lessons: v1Content.units.flatMap((unit, unitIndex) => {
      return unit.lessons.map((lesson, lessonIndex) => {
        const noteBlock = lesson.contentBlocks?.find((cb) => cb.type === "note");
        const exampleBlock = lesson.contentBlocks?.find(
          (cb) => cb.type === "example"
        );
        const exerciseBlock = lesson.contentBlocks?.find(
          (cb) => cb.type === "exercise"
        );
        const derivationBlock = lesson.contentBlocks?.find(
          (cb) => cb.type === "derivation"
        );

        // Build overview from summary and note blocks
        let overview = cleanText(lesson.summary || "");
        if (noteBlock?.body) {
          // Use note block as primary overview, append summary if different
          const noteText = cleanText(noteBlock.body);
          if (noteText && noteText !== overview) {
            overview = noteText + (overview ? `\n\n${overview}` : "");
          } else if (!overview) {
            overview = noteText;
          }
        }
        overview = cleanText(overview);

        // Extract bullets from content blocks and learning objectives
        const bullets: string[] = [];
        
        // Add learning objectives as bullets (clean them)
        if (unit.learningObjectives && unit.learningObjectives.length > 0) {
          unit.learningObjectives.forEach(obj => {
            const cleaned = cleanText(obj);
            // Filter out placeholder objectives
            if (cleaned && 
                !cleaned.match(/<!--.*?-->/g) && 
                !cleaned.match(/bullet \d+/i) &&
                !cleaned.toLowerCase().includes('tbd') &&
                !cleaned.toLowerCase().includes('todo') &&
                cleaned.length > 5) {
              bullets.push(cleaned);
            }
          });
        }
        
        // Extract bullets from note block if it has list format
        if (noteBlock?.body) {
          const bulletMatches = noteBlock.body.match(/^[-•*]\s+(.+)$/gm);
          if (bulletMatches) {
            bulletMatches.forEach((b) => {
              const cleaned = cleanText(b.replace(/^[-•*]\s+/, "").trim());
              // Filter out placeholder bullets
              if (cleaned && 
                  !cleaned.match(/<!--.*?-->/g) && 
                  !cleaned.match(/bullet \d+/i) &&
                  !cleaned.toLowerCase().includes('tbd') &&
                  !cleaned.toLowerCase().includes('todo') &&
                  cleaned.length > 5) {
                bullets.push(cleaned);
              }
            });
          }
        }
        
        // If no bullets yet, create from key terms
        if (bullets.length === 0 && unit.keyTerms && unit.keyTerms.length > 0) {
          unit.keyTerms.forEach(term => {
            const cleaned = cleanText(term);
            if (cleaned && cleaned.length > 2) {
              bullets.push(`Understand ${cleaned}`);
            }
          });
        }

        // Build practice items from exercise blocks and assessments
        const practice: string[] = [];
        
        // Add exercise blocks as practice items
        if (exerciseBlock?.body) {
          const cleaned = cleanText(exerciseBlock.body);
          if (cleaned && cleaned.length > 10) {
            practice.push(cleaned);
          }
        }
        
        // Add derivation blocks as practice
        if (derivationBlock?.body) {
          const cleaned = cleanText(derivationBlock.body);
          if (cleaned && cleaned.length > 10) {
            const preview = cleaned.substring(0, 100);
            practice.push(`Work through: ${preview}${cleaned.length > 100 ? '...' : ''}`);
          }
        }
        
        // Add default practice items if none exist
        if (practice.length === 0) {
          practice.push(
            "Paraphrase the core idea of this lesson in your own words.",
            "Create a small example that demonstrates the concept.",
            "Explain one common misconception and why it's incorrect."
          );
        }

        return {
          slug: slugify(lesson.title),
          unitNumber: unitIndex + 1,
          title: lesson.title,
          keyConcepts: {
            // Use first paragraph or first 200 chars of overview
            overview: overview.split("\n\n")[0]?.substring(0, 500) || overview.substring(0, 500) || "",
            bullets: bullets.length > 0 ? bullets : ["Review the key concepts from this lesson"],
          },
          practice,
          checks:
            lesson.assessments?.map((a, i) => ({
              id: `c${unitIndex + 1}-${lessonIndex + 1}-${i + 1}`,
              prompt: a.prompt,
              answer: a.answerKey,
              type:
                a.type === "quiz"
                  ? "mcq"
                  : a.type === "problem"
                  ? "calc"
                  : "short",
            })) || [],
        };
      });
    }),
  };

  return converted;
}

