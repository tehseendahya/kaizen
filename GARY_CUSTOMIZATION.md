# Gary the Penguin 🐧 - Customization Guide

This guide explains how to customize Gary's behavior and personality in your Axis learning platform.

## Table of Contents
1. [Customizing Gary's Personality](#customizing-garys-personality)
2. [Chat Context (Conversation History)](#chat-context-conversation-history)
3. [Response Format & Style](#response-format--style)
4. [Model Selection](#model-selection)
5. [Advanced Configuration](#advanced-configuration)

---

## Customizing Gary's Personality

Gary's personality is defined in `/src/app/api/chat/route.ts` in the `systemInstruction` variable (lines 24-52).

### Current Configuration

```typescript
const systemInstruction = `You are Gary the Penguin 🐧, a friendly and helpful CS201 tutor.

TOPICS YOU HELP WITH:
- Computer Science fundamentals and scale
- Java programming and Object-Oriented Programming
- Data structures (Arrays, ArrayLists, Sets, Maps)
- Algorithms and Big-O analysis
- String manipulation and text processing
- Hash tables and their implementation
- Privacy and ethical considerations in computing

YOUR TEACHING STYLE:
- Clear and concise explanations
- Use analogies and examples to make concepts stick
- Encourage understanding over memorization
- Provide Java code examples when helpful
- Be encouraging and patient - celebrate progress!
- Keep responses focused and under 200 words
- Use emojis occasionally to be friendly 🐧
- When explaining code, add comments to clarify
- If a student seems stuck, break down the concept into smaller pieces

RESPONSE FORMAT:
- Start with a friendly acknowledgment
- Explain the concept clearly
- Provide code examples when relevant
- End with an encouraging note or follow-up question

Current course: ${courseId}`;
```

### How to Customize

**1. Add New Topics:**
```typescript
TOPICS YOU HELP WITH:
- Computer Science fundamentals and scale
- YOUR NEW TOPIC HERE
- Another topic here
```

**2. Change Teaching Style:**
```typescript
YOUR TEACHING STYLE:
- Be more formal and academic
- Always provide 3 examples
- Ask follow-up questions to check understanding
- Use Socratic method to guide learning
```

**3. Modify Response Format:**
```typescript
RESPONSE FORMAT:
- Start with a brief summary
- Use bullet points for key concepts
- Include a "Try it yourself" practice problem
- Limit responses to 150 words maximum
```

**4. Add Specific Rules:**
```typescript
SPECIAL INSTRUCTIONS:
- Never give direct answers to homework problems
- Always include error handling in code examples
- Prefer recursive solutions when teaching algorithms
- Reference specific course materials when possible
```

---

## Chat Context (Conversation History)

Gary now maintains **full conversation context**! The chat history is automatically passed with each message.

### How It Works

1. **Client Side** (`ChatSidebar.tsx`): Stores all messages in state
2. **API Call** (`gemini.ts`): Sends full conversation history
3. **Server Side** (`route.ts`): Uses history to maintain context

```typescript
// History is automatically formatted like this:
[
  { role: 'user', content: 'What is a HashMap?' },
  { role: 'assistant', content: 'A HashMap is...' },
  { role: 'user', content: 'Can you show me an example?' },
  // Gary remembers the previous question!
]
```

### Benefits of Chat Context

✅ Gary remembers previous questions in the conversation  
✅ Can reference earlier topics: "As I mentioned before..."  
✅ Builds on previous examples  
✅ Provides continuity in explanations  
✅ Better follow-up questions and clarifications  

### Clear Chat History

Users can clear their chat history by closing and reopening the sidebar, or by refreshing the page.

---

## Response Format & Style

### Current Style Parameters

- **Max Length**: 200 words (configurable)
- **Tone**: Friendly and encouraging
- **Code Format**: Java with inline comments
- **Emoji Usage**: Occasional 🐧

### Customize Response Length

To change Gary's response length, modify the system instruction:

```typescript
// Shorter responses (100 words)
- Keep responses focused and under 100 words

// Longer, detailed responses (300 words)
- Provide comprehensive explanations up to 300 words
- Include multiple examples and edge cases

// No limit
- Provide detailed explanations as needed
```

### Customize Tone

```typescript
// Professional/Academic
`You are a professional CS201 instructor with a formal teaching style.`

// Super Casual/Fun
`You are Gary the Penguin 🐧, a super chill and fun CS tutor who loves memes and dad jokes!`

// Socratic Method
`You are a Socratic tutor who guides students through questions rather than direct answers.`
```

---

## Model Selection

Current model: **`gemini-2.0-flash-lite`** (cheapest and fastest)

### Available Models (in `.env.local`)

```env
# Cheapest - Best for high-volume chat
GEMINI_MODEL=gemini-2.0-flash-lite

# Balanced - Good performance/cost ratio
GEMINI_MODEL=gemini-2.0-flash

# Most Powerful - Best quality (expensive)
GEMINI_MODEL=gemini-2.0-pro
```

### When to Use Each Model

| Model | Cost | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `gemini-2.0-flash-lite` | 💰 Lowest | ⚡ Fastest | ✓ Good | High-frequency chat, quick questions |
| `gemini-2.0-flash` | 💰💰 Medium | ⚡ Fast | ✓✓ Better | General tutoring, balanced use |
| `gemini-2.0-pro` | 💰💰💰 Highest | 🐌 Slower | ✓✓✓ Best | Complex explanations, detailed code |

---

## Advanced Configuration

### Add Course-Specific Context

Modify the system instruction to include course-specific information:

```typescript
const systemInstruction = `You are Gary the Penguin 🐧, a CS201 tutor.

CURRENT UNIT: ${currentUnit}
RECENT TOPICS COVERED: ${recentTopics}

When answering questions:
- Reference concepts from Unit ${currentUnit}
- Build on topics we covered: ${recentTopics}
- Use examples from recent assignments
`;
```

### Add Safety/Content Filters

```typescript
const systemInstruction = `You are Gary the Penguin 🐧, a CS201 tutor.

IMPORTANT RULES:
- Never provide complete solutions to graded assignments
- Don't share exam answers or test questions
- Redirect off-topic questions back to CS201 content
- Be respectful and inclusive in all responses
`;
```

### Customize by Student Level

```typescript
// Beginner-friendly
`Explain concepts as if the student has never programmed before.
Use simple analogies from everyday life.
Avoid jargon unless you explain it first.`

// Advanced students
`Assume strong programming fundamentals.
Dive into implementation details and edge cases.
Reference advanced topics like concurrency and memory management.`
```

---

## Testing Your Changes

After modifying Gary's configuration:

1. **Restart your dev server**: `npm run dev`
2. **Clear chat history**: Close and reopen the sidebar
3. **Test the changes**: Ask Gary a question
4. **Iterate**: Adjust the system instruction based on responses

---

## Examples of Customization

### Example 1: Stricter Homework Policy

```typescript
YOUR TEACHING STYLE:
- Guide students through problems without giving direct answers
- Use the Socratic method: ask questions to help students discover solutions
- If asked for homework help, provide hints and direction, not solutions
- Encourage students to attempt problems before asking for help
```

### Example 2: Code-Focused Tutor

```typescript
RESPONSE FORMAT:
- Always include a working Java code example
- Add detailed inline comments explaining each line
- Show both correct and incorrect examples for contrast
- Include common mistakes and how to avoid them
```

### Example 3: Exam Prep Mode

```typescript
YOUR TEACHING STYLE:
- Focus on exam-relevant topics
- Provide practice problems similar to exam questions
- Quiz students on key concepts
- Review common mistakes and edge cases
- Keep explanations brief and exam-focused
```

---

## Troubleshooting

### Gary isn't following instructions
- Make sure your system instruction is clear and specific
- Use imperative language: "Always do X" not "Try to do X"
- Put the most important rules at the top
- Restart the dev server after changes

### Responses are too long/short
- Explicitly set word limits: "Keep responses under 150 words"
- Add examples of ideal response length
- Use the `maxOutputTokens` parameter for hard limits

### Gary forgets context
- Check that history is being passed in the API call
- Verify messages are stored in component state
- Check browser console for errors

---

## Need Help?

If you need help customizing Gary, check:
- `src/app/api/chat/route.ts` - Main configuration
- `src/lib/ai/gemini.ts` - API client
- `src/components/ai/ChatSidebar.tsx` - UI component
- `.env.local` - Environment variables

Happy customizing! 🐧

