
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all interactions with the Google GenAI SDK.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      // Fix: Use process.env.API_KEY directly for initialization as per @google/genai guidelines.
      // This also resolves the TypeScript 'Property env does not exist on type ImportMeta' error.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        // Fix: Use gemini-3-pro-preview for complex strategic business reasoning tasks.
        model: "gemini-3-pro-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
          // Disable thinking budget to ensure lightning-fast responses as requested by the persona.
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      // Fix: Access the .text property directly (not as a method) as per guidelines.
      const text = response.text || "I'm sorry, I couldn't generate a response.";
      
      // Extract grounding metadata for sources from Google Search as required for search grounding.
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
