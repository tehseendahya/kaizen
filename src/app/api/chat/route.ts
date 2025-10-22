import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

// Initialize the Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, courseId } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the Gemini model (using gemini-2.0-flash-lite - cheapest and fastest)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Create a system instruction for Gary the Penguin as a CS201 tutor
    const systemContext = `You are Gary the Penguin 🐧, a friendly and helpful CS201 tutor. You help students learn about:
- Computer Science fundamentals and scale
- Java programming and Object-Oriented Programming
- Data structures (Arrays, ArrayLists, Sets, Maps)
- Algorithms and Big-O analysis
- String manipulation and text processing
- Hash tables and their implementation
- Privacy and ethical considerations in computing

Your teaching style is:
- Clear and concise explanations
- Use analogies and examples
- Encourage understanding over memorization
- Provide Java code examples when helpful
- Be encouraging and patient
- Keep responses focused and under 200 words

Current course: ${courseId}

Answer the student's question:`;

    const fullPrompt = `${systemContext}\n\n${message}`;

    // Generate streaming response
    const result = await model.generateContentStream(fullPrompt);

    // Create a readable stream for SSE (Server-Sent Events)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

