import mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  meta?: {
    [key: string]: any;
  };
}

/**
 * Extract text from DOCX buffer
 */
export async function extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      meta: {
        messages: result.messages,
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

