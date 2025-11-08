import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Curriculum } from './schemas';

export type AIProvider = 'gemini' | 'openai';

export interface AIClient {
  organizeCurriculum(prompt: string): Promise<Curriculum>;
  enrichSubunit(prompt: string): Promise<{
    intuition: string;
    worked_example: string;
    pitfalls: string;
    recap: string;
    code_sketch: string;
    references: string;
  }>;
}

/**
 * Factory function to get AI client based on provider
 */
export function getAiClient(provider: AIProvider = 'gemini'): AIClient {
  switch (provider) {
    case 'gemini':
      return new GeminiClient();
    case 'openai':
      // TODO: Implement OpenAI client
      throw new Error('OpenAI provider not yet implemented');
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Gemini AI Client Implementation
 */
class GeminiClient implements AIClient {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
  }

  async organizeCurriculum(prompt: string): Promise<Curriculum> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.3, // Lower for more structured output
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 16000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    try {
      const parsed = JSON.parse(jsonText);
      return parsed as Curriculum;
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}\n\nResponse: ${text.slice(0, 500)}`);
    }
  }

  async enrichSubunit(prompt: string): Promise<{
    intuition: string;
    worked_example: string;
    pitfalls: string;
    recap: string;
    code_sketch: string;
    references: string;
  }> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 4000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    try {
      const parsed = JSON.parse(jsonText);
      return {
        intuition: parsed.intuition || '',
        worked_example: parsed.worked_example || '',
        pitfalls: parsed.pitfalls || '',
        recap: parsed.recap || '',
        code_sketch: parsed.code_sketch || '',
        references: parsed.references || '',
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}\n\nResponse: ${text.slice(0, 500)}`);
    }
  }
}

