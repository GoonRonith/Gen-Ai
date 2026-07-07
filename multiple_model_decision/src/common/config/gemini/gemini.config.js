import { GoogleGenAI } from "@google/genai";

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


export default geminiClient
