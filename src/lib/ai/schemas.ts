import { z } from 'zod';

/**
 * Zod schemas for AI-generated curriculum structure
 * Used to validate AI responses before saving to database
 */

export const SubunitSchema = z.object({
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  raw_text: z.string().optional(),
  intuition: z.string().min(1),
  worked_example: z.string().min(1),
  pitfalls: z.string().min(1),
  recap: z.string().min(1),
  code_sketch: z.string().optional().default(''),
  references: z.string().optional().default(''),
});

export const UnitSchema = z.object({
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  summary: z.string().optional().default(''),
  subunits: z.array(SubunitSchema).min(1),
});

export const CurriculumSchema = z.object({
  course: z.object({
    code: z.string().min(1),
    title: z.string().min(1),
  }),
  units: z.array(UnitSchema).min(1),
});

export type Curriculum = z.infer<typeof CurriculumSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type Subunit = z.infer<typeof SubunitSchema>;

