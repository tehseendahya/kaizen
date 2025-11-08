export interface ExtractionResult {
  text: string;
  meta?: {
    [key: string]: any;
  };
}

/**
 * Extract text from plain text or markdown buffer
 */
export async function extract(buffer: Buffer, filename: string): Promise<ExtractionResult> {
  try {
    const text = buffer.toString('utf-8');
    return {
      text,
      meta: {
        encoding: 'utf-8',
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file type from filename
 */
export function getFileType(filename: string): 'pdf' | 'docx' | 'txt' | 'md' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'docx':
    case 'doc':
      return 'docx';
    case 'txt':
      return 'txt';
    case 'md':
    case 'markdown':
      return 'md';
    default:
      return 'unknown';
  }
}

/**
 * Extract text from any supported file type
 */
export async function extractFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  const fileType = getFileType(filename);

  switch (fileType) {
    case 'pdf':
      const { extract: extractPdf } = await import('./pdf');
      return extractPdf(buffer, filename);
    case 'docx':
      const { extract: extractDocx } = await import('./docx');
      return extractDocx(buffer, filename);
    case 'txt':
    case 'md':
      return extract(buffer, filename);
    default:
      throw new Error(`Unsupported file type: ${filename}. Supported: PDF, DOCX, TXT, MD`);
  }
}

