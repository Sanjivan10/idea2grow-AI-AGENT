import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all interactions with the Google GenAI SDK.
 * 
 * Note: The API key must be obtained exclusively from process.env.API_KEY.
 * This is a requirement for the platform's secure key management and 
 * injection system.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      /**
       * Initialization follows the mandatory pattern for this environment:
       * new GoogleGenAI({ apiKey: process.env.API_KEY })
       */
      const ai = new GoogleGenAI({ apiKey: 'AIzaSyBZK3H3fZm4uJ5J-8Tm8-2O-cYDnxdZmE' });
      
      const response = await ai.models.generateContent({
        // Using gemini-3-pro-preview for complex strategic business reasoning
        model: "gemini-3-pro-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
          // Optimize for speed by setting thinking budget to 0
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      // The .text property returns the extracted string output directly
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
      console.error("Strategic Service Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
