export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface AIRequest {
  prompt: string;
  context?: string;
  documentType?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface AIService {
  readonly name: string;
  readonly provider: AIProvider;
  generate(prompt: string, context?: string): Promise<AIResponse>;
  generateDocument(type: string, details: Record<string, string>): Promise<AIResponse>;
}

class GeminiService implements AIService {
  readonly name = 'Gemini';
  readonly provider: AIProvider = 'gemini';

  async generate(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
      if (!apiKey) {
        return { content: '', success: false, error: 'Gemini API key not configured' };
      }
      const ai = new GoogleGenAI({ apiKey });
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      const result = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: fullPrompt });
      return { content: result.text || '', success: true };
    } catch (err) {
      return { content: '', success: false, error: err instanceof Error ? err.message : 'AI generation failed' };
    }
  }

  async generateDocument(type: string, details: Record<string, string>): Promise<AIResponse> {
    const prompt = `Generate a professional ${type} document with the following details:\n${Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nFormat the output as a professional business document with appropriate sections.`;
    return this.generate(prompt);
  }
}

class OpenAIService implements AIService {
  readonly name = 'OpenAI';
  readonly provider: AIProvider = 'openai';

  private getApiKey(): string {
    return import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async generate(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) return { content: '', success: false, error: 'OpenAI API key not configured' };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: context || 'You are a professional business document writer.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return { content: data.choices?.[0]?.message?.content || '', success: true };
    } catch (err) {
      return { content: '', success: false, error: err instanceof Error ? err.message : 'AI request failed' };
    }
  }

  async generateDocument(type: string, details: Record<string, string>): Promise<AIResponse> {
    const prompt = `Write a professional ${type} document.\nDetails:\n${Object.entries(details).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`;
    return this.generate(prompt);
  }
}

let activeAIService: AIService = new GeminiService();

export function getAIService(): AIService {
  return activeAIService;
}

export function setAIService(service: AIService) {
  activeAIService = service;
}

export function createAIService(provider: AIProvider, apiKey?: string): AIService {
  switch (provider) {
    case 'gemini':
      return new GeminiService();
    case 'openai':
      return new OpenAIService();
    default:
      return new GeminiService();
  }
}
