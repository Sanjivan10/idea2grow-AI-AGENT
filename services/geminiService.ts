import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all interactions with the Google GenAI SDK.
 * 
 * Performance Note: We utilize process.env.API_KEY exclusively as it is the 
 * secure, platform-standard way to access the Gemini API. This variable 
 * is automatically injected by the environment.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      /**
       * Initialization follows the mandatory platform pattern: new GoogleGenAI({ apiKey: process.env.API_KEY })
       * This ensures compatibility with the build system's automated key management.
       */
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        // Using gemini-3-pro-preview for advanced strategic business reasoning
        model: "gemini-3-pro-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
          // Optimization: Disable thinking budget for real-time responsiveness
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      // The .text property is accessed directly as per the latest SDK guidelines
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
