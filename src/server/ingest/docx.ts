/**
 * DOCX extraction using mammoth
 */

import mammoth from 'mammoth';

export type DOCXExtractionResult = {
  text: string;
  messages: string[];
};

export async function extractDOCX(buffer: Buffer): Promise<DOCXExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value || '',
      messages: result.messages.map(m => m.message)
    };
  } catch (error: any) {
    console.error('[extractDOCX] Error:', error);
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
}

