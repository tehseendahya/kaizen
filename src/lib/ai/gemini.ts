/**
 * Send a chat message to Gary the Penguin (powered by Gemini AI)
 * Returns an async generator that yields chunks of the response as they arrive
 */
export async function* sendGeminiChat(
  message: string,
  courseId: string = 'cs201'
): AsyncGenerator<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, courseId }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Chat error:', error);
    yield 'Sorry, I encountered an error. Please try again! 🐧';
  }
}

