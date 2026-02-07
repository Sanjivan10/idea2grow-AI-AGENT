import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * GeminiService handles all interactions with the Google GenAI SDK.
 * 
 * Secure API Management:
 * The API key is obtained exclusively from process.env.API_KEY.
 * This variable is pre-configured and injected by the environment 
 * to ensure secure and valid access to Google's Generative AI services.
 */
export class GeminiService {
  /**
   * Generates a strategic response using the Gemini API.
   * Leverages Google Search grounding for real-time site-specific data.
   */
  async generateResponse(prompt: string, history: { role: string, parts: { text: string }[] }[]) {
    try {
      // Always initialize with process.env.API_KEY as per platform security standards.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        // Utilizing gemini-3-pro-preview for advanced reasoning and complex strategic analysis.
        model: "gemini-3-pro-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
          // Optimization: Disable thinking budget to ensure immediate summarized feedback for the user.
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      // Extract generated text directly from the response object's .text property.
      const text = response.text || "I'm sorry, I couldn't generate a response at this moment.";
      
      // Extract grounding metadata to provide verifiable business sources from Google Search.
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || "Source",
          uri: chunk.web?.uri || ""
        }))
        .filter((s: any) => s.uri !== "");

      return { text, sources };
    } catch (error) {
      console.error("Idea2Grow Strategic Intelligence Service Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();