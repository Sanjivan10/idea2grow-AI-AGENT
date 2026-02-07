
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService: High-Performance Advisor for Idea2Grow.
 * 
 * Secure Deployment Architecture:
 * - API Key is retrieved EXCLUSIVELY via process.env.API_KEY (platform-managed).
 * - Model: 'gemini-3-flash-preview' for instant strategic synthesis.
 * - Thinking Budget: 0 for minimal latency.
 */
export class GeminiService {
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      /**
       * Crucial: We use the platform-provided process.env.API_KEY.
       * Do not hardcode keys in source code for production security.
       */
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
          temperature: 0.5,
          thinkingConfig: { thinkingBudget: 0 } // Optimization for rapid response
        },
      });

      const text = response.text || "I apologize, I was unable to synthesize the requested insight. Please clarify your vision.";
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || "Strategic Resource",
          uri: chunk.web?.uri || ""
        }))
        .filter((s: any) => s.uri !== "");

      return { text, sources };
    } catch (error: any) {
      console.error("Idea2Grow Intelligence Engine Failure:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
