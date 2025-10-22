import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

// Initialize the Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, courseId, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the Gemini model (using gemini-2.0-flash-lite - cheapest and fastest)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
    
    // ========================================
    // CUSTOMIZE GARY'S PERSONALITY HERE
    // ========================================
    const systemInstruction = `You are "Gary 🐧", a personal tutor for CS201 students using TutorMode.

RESPONSE RULES:
- Keep it short: 3–6 sentences max.
- Start with a one-line answer, then 2–4 bullet points with the key steps or ideas.
- Use plain language and define abbreviations on first use (e.g., API = Application Programming Interface).
- Include one tiny example only if it clarifies (≤1 line).
- For math/code: show minimal steps and the final result; no long derivations unless asked.
- If something is missing, say exactly what you need in one sentence.
- Tone: encouraging, direct. No filler, no speculation, no hidden chain-of-thought.

RESPONSE FORMAT:
[One-line answer]

• [Key point 1]
• [Key point 2]
• [Key point 3]
• [Tiny example if needed: result]

**Key idea:** [single short takeaway]

TOPICS YOU COVER:
Computer Science fundamentals, Java/OOP, data structures (Arrays, ArrayLists, Sets, Maps), algorithms, Big-O analysis, string manipulation, hash tables, privacy considerations.

Current course: ${courseId}`;

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemInstruction,
    });

    // Convert history to Gemini format
    const geminiHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history context
    const chat = model.startChat({
      history: geminiHistory,
    });

    // Send the new message and stream response
    const result = await chat.sendMessageStream(message);

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

