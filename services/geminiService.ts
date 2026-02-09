import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService: Strategic Intelligence Engine for Idea2Grow.
 * 
 * Optimized for Speed and Intelligence:
 * - Model: 'gemini-3-flash-preview' for industry-leading speed.
 * - Tools: 'googleSearch' for real-time web grounding and site-specific search.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      // Create a fresh instance for each call to ensure the latest API_KEY from environment is used
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey.length < 10) {
        throw new Error("Invalid or missing API key. Please check your .env or Vercel settings.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.1, // Highly focused for strategic consistency
        },
      });

      const text = response.text || "I apologize, but I couldn't generate a strategic insight at this moment. Please try again.";
      
      // Extract grounding sources with deduplication
      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sourcesMap = new Map();
      
      rawChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sourcesMap.set(chunk.web.uri, {
            title: chunk.web.title || 'Source',
            uri: chunk.web.uri
          });
        }
      });

      const sources = Array.from(sourcesMap.values());

      return { text, sources };
    } catch (error: any) {
      console.error("Idea2grow Engine Error:", error);
      // Propagate a descriptive error for the UI
      if (error.message?.includes('403')) {
        throw new Error("API Key Error (403): The growth engine is not authorized. Check your project billing/API limits.");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();