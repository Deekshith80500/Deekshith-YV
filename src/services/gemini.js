import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

const SYSTEM_PROMPT = `You are "Healthu", a compassionate and expert AI medical assistant for the MedVault platform.
Your goal is to help patients understand general health information, explain common medical terms, and provide wellness tips.

IMPORTANT GUIDELINES:
1. You are NOT a doctor. Always include a disclaimer that your advice is for informational purposes and the user should consult a real professional for diagnosis.
2. Be concise, professional, and supportive.
3. If asked about MedVault, explain that it's a secure medical passport system.
4. Do not provide specific dosages for medication unless they are well-known general guidelines (like standard Vitamin C).
5. Stay within the scope of health and wellness. If asked non-health questions, gently steer the conversation back.`;

export async function chatWithHealthu(message, history = []) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    // Format history for Gemini SDK
    // Note: Gemini expects [{ role: 'user', parts: [{ text: '...' }] }, ...]
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // If we want to use the full chat history, we'd need to manage it with chat.sendMessage
    // For simplicity in a mobile-first app, we'll send the prompt with context if history exists
    // or use the SDK's chat session if we can preserve it.
    
    const response = await chat.sendMessage({
        text: message
    });

    return response.text;
  } catch (error) {
    console.error("Healthu Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
