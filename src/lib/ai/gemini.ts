/**
 * Send a chat message to Gary the Penguin (powered by Gemini AI)
 * Returns an async generator that yields chunks of the response as they arrive
 * 
 * @param message - The user's message
 * @param courseId - The course identifier (e.g., 'cs201')
 * @param history - Optional conversation history for context
 */
export async function* sendGeminiChat(
  message: string,
  courseId: string = 'cs201',
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): AsyncGenerator<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, courseId, history }),
    });

    if (!response.ok) {
      // Try to get error details from the response
      try {
        const errorData = await response.json();
        const errorMsg = errorData.message || errorData.error || `API error: ${response.status}`;
        throw new Error(errorMsg);
      } catch {
        throw new Error(`API error: ${response.status}`);
      }
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('API key not configured')) {
      yield '⚠️ **API Key Missing**\n\nGary needs a Google Gemini API key to work!\n\n**To fix this:**\n1. Create a `.env.local` file in the project root\n2. Add: `GOOGLE_API_KEY=your_key_here`\n3. Get a free key at: https://makersuite.google.com/app/apikey\n4. Restart the dev server\n\nSee SETUP.md for detailed instructions! 🐧';
    } else {
      yield `Sorry, I encountered an error: ${errorMessage}\n\nPlease try again! If the problem persists, check the console for details. 🐧`;
    }
  }
}

