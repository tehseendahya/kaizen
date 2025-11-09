# Image Upload Support for Course Materials

## Overview
Added support for uploading screenshots and images (JPG, PNG, GIF, WEBP) alongside PDFs and documents. Images are automatically processed using OpenAI's Vision API (GPT-4o) to extract text content.

## Supported Image Formats
- ✅ **JPG/JPEG** - Standard photo format
- ✅ **PNG** - Screenshots, diagrams
- ✅ **GIF** - Animated or static images
- ✅ **WEBP** - Modern web image format

## How It Works

### 1. **Upload**
- Professors can now upload images through the same file upload interface
- Images are accepted alongside PDFs, DOCX, TXT, and MD files
- Maximum file size: 200MB per file

### 2. **Text Extraction (OCR)**
- Images are processed using **OpenAI GPT-4o Vision API**
- Automatically extracts:
  - Text content
  - Code snippets
  - Equations and formulas
  - Diagram descriptions
  - Structured content (preserves formatting)

### 3. **Course Generation**
- Extracted text from images is included in the AI course generation
- Works seamlessly with text from PDFs and documents
- All content is combined to create comprehensive courses

## Technical Details

### Files Modified
1. **`src/app/prof/ingest/new/page.tsx`**
   - Updated file input `accept` attribute to include image formats
   - Updated UI text to mention image support

2. **`src/app/api/prof/ingest/[ingestionId]/parse/route.ts`**
   - Added MIME type detection for image formats
   - Maps file extensions to correct MIME types

3. **`src/lib/parsing/parseUploads.ts`**
   - Added image OCR processing using OpenAI Vision API
   - Converts images to base64 for API
   - Uses GPT-4o model for best accuracy
   - Handles errors gracefully with fallback messages

### OCR Process
```typescript
1. Image uploaded → Stored in Supabase Storage
2. Image downloaded → Converted to base64
3. Sent to OpenAI Vision API (GPT-4o)
4. Text extracted and returned
5. Text saved to course_uploads.parsed_text
6. Included in AI course generation
```

### Error Handling
- If OCR fails, a placeholder message is saved
- Upload continues even if OCR fails
- Error details are logged for debugging
- User sees clear error messages

## Requirements

### Environment Variables
Make sure you have `OPENAI_API_KEY` set in your `.env.local`:
```env
OPENAI_API_KEY=sk-...your-key-here...
```

### API Costs
- **GPT-4o Vision**: ~$0.01-0.05 per image (depending on size)
- Much more accurate than traditional OCR
- Handles complex layouts, code, and equations better

## Usage Example

1. **Upload Images**:
   - Go to `/prof/ingest/new`
   - Select or drag images (screenshots, diagrams, etc.)
   - Upload alongside PDFs and documents

2. **Parse Files**:
   - Click "📄 Parse Files"
   - Images are automatically processed with OCR
   - Text is extracted and saved

3. **Generate Course**:
   - Click "✨ Generate AI Draft"
   - AI uses text from both documents AND images
   - Creates comprehensive course content

## Benefits

✅ **Screenshots**: Upload lecture slides, whiteboard photos, etc.
✅ **Diagrams**: Extract text from flowcharts, diagrams, and visual content
✅ **Code**: Capture code snippets and technical documentation
✅ **Handwritten Notes**: Can extract text from handwritten content (accuracy varies)
✅ **Mixed Content**: Combine PDFs, images, and documents seamlessly

## Limitations

⚠️ **Large Images**: Very large images may take longer to process
⚠️ **Complex Layouts**: Some complex layouts may not extract perfectly
⚠️ **Handwriting**: Handwritten text accuracy depends on clarity
⚠️ **Cost**: Each image uses OpenAI API credits (~$0.01-0.05 per image)

## Future Enhancements

Potential improvements:
- Batch processing for multiple images
- Image preview in upload interface
- Manual text correction for OCR errors
- Support for more image formats (TIFF, BMP, etc.)
- Image compression before OCR to reduce costs

