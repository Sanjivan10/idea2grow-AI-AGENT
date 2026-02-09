
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
      // Re-initialize inside the call to ensure the latest API_KEY from process.env is used.
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
          temperature: 0.2, // Lower temperature for more deterministic and faster extraction
        },
      });

      const text = response.text || "I'm sorry, I couldn't generate a strategic insight at this moment. Please try again.";
      
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
      console.error("Idea2grow Engine Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
