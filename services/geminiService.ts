
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all interactions with the Google GenAI SDK.
 * Note: The API key must be obtained exclusively from process.env.API_KEY.
 * For Netlify deployments, please ensure you map your GEMINI_API_KEY to API_KEY 
 * in your site's environment variable settings.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not defined.");
      }
      
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
