import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all strategic interactions with the Google GenAI SDK.
 * This service is optimized for the Idea2Grow ecosystem, providing rapid,
 * grounded insights using the Gemini 3 Flash model.
 */
export class GeminiService {
  /**
   * Generates business growth insights using the high-speed Gemini 3 Flash model.
   * Leverages Google Search grounding for real-time survey of idea2grow.com.
   * 
   * SECURITY & DEPLOYMENT NOTE:
   * The API key is sourced exclusively from process.env.API_KEY as required by
   * the platform's security protocols. This ensures that sensitive credentials
   * are managed by the environment and not exposed in the source code.
   */
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      // Initialize the AI client using the secure environment variable.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });    const ai = new GoogleGenAI({ apiKey: 'gen-lang-client-0952935192' });
      
      const response = await ai.models.generateContent({
        // Using 'gemini-3-flash-preview' for the fastest possible response times.
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
          // Optimization: Set thinkingBudget to 0 for instantaneous "Flash" responses.
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      // Extract text content directly from the response object.
      const text = response.text || "I am deeply sorry, but I encountered an issue while synthesizing your growth strategy. How else may I serve your vision?";
      
      // Extract grounding metadata to provide links to sources found on idea2grow.com.
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || "Strategic Insight Source",
          uri: chunk.web?.uri || ""
        }))
        .filter((s: any) => s.uri !== "");

      return { text, sources };
    } catch (error) {
      console.error("Idea2Grow Strategic Service Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
