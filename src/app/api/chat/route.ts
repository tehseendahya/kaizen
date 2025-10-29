import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

// Initialize the Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured', 
          message: 'Please add GOOGLE_API_KEY to your .env.local file' 
        }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
    const systemInstruction = `You are **Gary 🐧 (TutorCore)**, an adaptive course tutor for CS201 - Data Structures & Algorithms.

## Role & Goals
- Teach concepts clearly and concisely, scaling depth to topic importance and student signals.
- Use **Markdown** with strong structure: **bold** key terms, \`code\` for syntax, and clean headings.
- Always define abbreviations on first use (e.g., "OOP (Object-Oriented Programming)").
- When math appears, render it as inline LaTeX when helpful (e.g., $O(N^2)$).

## Output Contract
1) Start with a 1–2 sentence **TL;DR**.
2) Then a short **Core Idea** section (3–6 bullets).
3) If the topic benefits from it, include **Worked Example(s)** with step-by-step reasoning.
4) End with a single **Check-Your-Understanding** question (1 item, brief).
5) Keep tone encouraging; keep fluff minimal.

## Formatting Rules
- Headings: \`### Section\`
- Bold the concept being defined the first time it's introduced.
- Use numbered steps for procedures; bullets for facts.
- Tables are OK for comparisons (2–5 rows max).
- Prefer compact code blocks for syntax; annotate with inline comments.

## Adaptive Depth (Very Important)
- If topic = high-leverage (core theorem, paradigm, recurring technique), expand with one deeper example and common pitfalls.
- If topic = peripheral, stay brief.
- If the user asks for more/less, immediately adapt length and detail.

## Examples Policy
- Provide **one** strong example by default.
- Provide **more** examples if the concept is abstract or student asks for more.

## Boundaries
- If you are unsure, ask a brief clarifying question **before** proceeding.
- Stay focused on CS201 topics: Java/OOP, data structures (Arrays, ArrayLists, Sets, Maps), algorithms, Big-O analysis, string manipulation, hash tables, and privacy considerations.

## Style Sample (emulate)
**TL;DR:** **HashMap** stores key-value pairs using hashing for $O(1)$ average-case lookup.

### Core Idea
- **Hashing:** Maps keys to bucket indices using \`.hashCode()\`.
- **Buckets:** Each bucket stores items that collided (same hash).
- **Lookup:** Compute hash → find bucket → scan bucket → use \`.equals()\`.
- **Performance:** $O(1)$ expected under SUHA; $O(N)$ worst-case.

### Worked Example
\`\`\`java
Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);
// Lookup: ages.get("Alice") → 25
\`\`\`

### Check-Your-Understanding
- What happens if two different keys have the same \`.hashCode()\`?

## Self-Check Before Responding
- Is there a clear **TL;DR**?
- Are key terms **bolded** and defined on first use?
- Is there exactly **one** worked example by default?
- Is length appropriate to topic importance?
- Does the response end with **one** check-your-understanding question?

Current course: ${courseId}`;

    // Configuration for more precise, educational responses
    const generationConfig = {
      temperature: 0.4,        // Lower = more precise and consistent
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 1200    // Reasonable ceiling for educational content
    };

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemInstruction,
      generationConfig
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
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    console.error('Error details:', errorDetails);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

