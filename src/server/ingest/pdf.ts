/**
 * PDF extraction using pdf-parse
 */

import { parsePDF } from '@/lib/parsing/pdf-parse-wrapper';

export type PDFExtractionResult = {
  text: string;
  pageCount: number;
  metadata?: Record<string, any>;
};

export async function extractPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const result = await parsePDF(buffer);

    return {
      text: result.text || '',
      pageCount: result.numpages || 0,
      metadata: result.info || {}
    };
  } catch (error: any) {
    console.error('[extractPDF] Error:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

