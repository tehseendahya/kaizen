import pdfParse from 'pdf-parse';

export interface ExtractionResult {
  text: string;
  meta?: {
    pages?: number;
    info?: any;
  };
}

/**
 * Extract text from PDF buffer
 */
export async function extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
  try {
    const data = await pdfParse(buffer);
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

