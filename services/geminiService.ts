import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all interactions with the Google GenAI SDK.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      // Accessing GEMINI_API_KEY as requested for specific deployment environment
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined. Please verify your Netlify settings.");
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
          temperature: 0.4,
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      const text = response.text || "I'm sorry, I couldn't generate a response.";
      
      // Extract grounding metadata for sources from Google Search
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || "Source",
          uri: chunk.web?.uri || ""
        }))
        .filter((s: any) => s.uri !== "");

      return { text, sources };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
