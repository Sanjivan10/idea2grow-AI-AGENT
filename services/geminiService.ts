import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService: High-Performance Strategic Engine for Idea2Grow.
 * 
 * Optimized for Speed and Intelligence:
 * - Model: 'gemini-3-flash-preview' for industry-leading speed.
 * - Tools: 'googleSearch' for real-time web grounding.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      // Get key and trim any accidental whitespace
      const apiKey = (process.env.API_KEY || "").trim();
      
      if (!apiKey || apiKey.length < 10) {
        throw new Error("Missing or invalid API_KEY. Please ensure you've added 'API_KEY' to your deployment environment variables.");
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
          temperature: 0.1,
        },
      });

      const text = response.text || "I apologize, but I encountered an error generating your growth insight. Please try again.";
      
      // Extract grounding sources with deduplication
      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sourcesMap = new Map();
      
      rawChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          sourcesMap.set(chunk.web.uri, {
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });

      const sources = Array.from(sourcesMap.values());

      return { text, sources };
    } catch (error: any) {
      console.error("Idea2grow Strategic Engine Error:", error);
      // More descriptive errors for the UI
      if (error.message?.includes('403')) {
        throw new Error("Growth Engine Unauthorized (403): Please verify your API Key is active in the Google AI Studio console.");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();