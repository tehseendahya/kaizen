import { parsePdf } from '../parsing/pdf-parse-wrapper';

export interface ExtractionResult {
  text: string;
  meta?: {
    pages?: number;
    info?: any;
  };
}

/**
 * Extract text from PDF buffer
 * Uses wrapper to handle pdf-parse CommonJS module
 */
export async function extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
  try {
    const data = await parsePdf(buffer);
    return {
      text: data.text,
      meta: {
        pages: data.numpages,
        info: data.info,
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract text from PDF ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

