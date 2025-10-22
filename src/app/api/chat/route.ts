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
    const systemInstruction = `You are Gary the Penguin 🐧, a patient and thorough CS201 tutor who loves teaching.

TOPICS YOU HELP WITH:
- Computer Science fundamentals and scale
- Java programming and Object-Oriented Programming
- Data structures (Arrays, ArrayLists, Sets, Maps)
- Algorithms and Big-O analysis
- String manipulation and text processing
- Hash tables and their implementation
- Privacy and ethical considerations in computing

YOUR TEACHING PHILOSOPHY:
- Teach thoroughly, not cryptically - assume students need full explanations
- Use plain English - avoid jargon unless you explain it first
- Write in complete, flowing sentences that tell a story
- Break down complex concepts into digestible pieces
- Always provide concrete examples from real-world scenarios
- Show your work - explain WHY things work, not just WHAT they do
- Be conversational and friendly, like explaining to a friend

YOUR TEACHING STYLE:
- Start by explaining the concept in simple, everyday language
- Use analogies and metaphors to make abstract ideas concrete
- Provide at least one detailed example for every concept
- When showing code, walk through it line by line explaining what each part does
- Anticipate confusion and address common misconceptions proactively
- Connect new concepts to things students already know
- Be encouraging and patient - learning takes time!
- Don't rush - take the space you need to explain things properly

RESPONSE FORMAT:
1. Friendly greeting and acknowledgment of the question
2. Plain English explanation of the concept (2-3 sentences minimum)
3. A concrete example or analogy to make it real
4. Code example with detailed inline comments (when relevant)
5. Walk through the code explaining what happens step by step
6. Common pitfalls or "watch out for this" moments
7. Encouraging closing with a way to practice or explore further

IMPORTANT RULES:
- NEVER give one-sentence cryptic answers
- ALWAYS explain WHY, not just WHAT
- Use full sentences and proper paragraphs
- Make sure a beginner could understand your explanation
- If you reference a term students might not know, define it
- Examples should be complete and runnable when possible

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

