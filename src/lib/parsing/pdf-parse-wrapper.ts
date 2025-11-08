/**
 * Server-only wrapper for pdf-parse
 * Handles CommonJS/ESM compatibility issues in Next.js
 * 
 * This file MUST only be imported in server-side code (API routes, server actions)
 * 
 * Uses pdf-parse v1.1.1 which exports as a function directly
 */

// Cache the module
let pdfParseFn: any = null;

/**
 * Parse PDF buffer
 * Uses require() for pdf-parse v1.1.1 which is a CommonJS module
 */
export async function parsePdf(buffer: Buffer): Promise<{ text: string; numpages?: number; info?: any }> {
  // Lazy load the module
  if (!pdfParseFn) {
    try {
      // Use require() for CommonJS modules in Node.js server context
      // pdf-parse v1.1.1 exports as a function directly
      // @ts-ignore - require is available in Node.js server context
      if (typeof require === 'undefined') {
        throw new Error('require() is not available. This function must run in Node.js server environment.');
      }
      
      // @ts-ignore
      const pdfParseModule = require('pdf-parse');
      
      // pdf-parse v1.1.1 exports as a function directly
      if (typeof pdfParseModule === 'function') {
        pdfParseFn = pdfParseModule;
      } else if (pdfParseModule && typeof pdfParseModule.default === 'function') {
        // Handle ESM default export (shouldn't happen with v1.1.1 but just in case)
        pdfParseFn = pdfParseModule.default;
      } else {
        // Log detailed info for debugging
        console.error('[parsePdf] Unexpected module structure:', {
          type: typeof pdfParseModule,
          keys: pdfParseModule ? Object.keys(pdfParseModule).slice(0, 10) : [],
          hasDefault: pdfParseModule && 'default' in pdfParseModule,
        });
        
        throw new Error(
          `pdf-parse module is not a function. ` +
          `Type: ${typeof pdfParseModule}. ` +
          `Expected pdf-parse v1.1.1. ` +
          `Try: npm uninstall pdf-parse && npm install pdf-parse@1.1.1`
        );
      }
      
      console.log('[parsePdf] Successfully loaded pdf-parse module');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('[parsePdf] Failed to load pdf-parse:', {
        message: errorMessage,
        stack: error?.stack,
        name: error?.name,
      });
      
      throw new Error(
        `Failed to load pdf-parse: ${errorMessage}. ` +
        `Make sure pdf-parse v1.1.1 is installed: npm install pdf-parse@1.1.1`
      );
    }
  }
  
  // Parse the PDF
  try {
    const result = await pdfParseFn(buffer);
    return {
      text: result.text || '',
      numpages: result.numpages,
      info: result.info,
    };
  } catch (parseError: any) {
    const errorMessage = parseError?.message || 'Unknown parsing error';
    console.error('[parsePdf] Error parsing PDF:', {
      message: errorMessage,
      name: parseError?.name,
      bufferSize: buffer?.length,
    });
    throw new Error(`Failed to parse PDF: ${errorMessage}`);
  }
}
