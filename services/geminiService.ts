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
      // The API key is obtained directly from process.env.API_KEY.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.2, 
        },
      });

      const text = response.text || "I apologize, but I couldn't generate a response. Please try again.";
      
      // Extract grounding sources from the response metadata
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
      console.error("Idea2grow Strategic Engine Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();