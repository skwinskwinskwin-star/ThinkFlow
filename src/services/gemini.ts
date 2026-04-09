import { GoogleGenAI } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

// Initialize Gemini directly in the frontend as per system guidelines.
let aiInstance: any = null;
let cachedKey: string | null = null;

const getApiKey = async () => {
  console.log("[GEMINI] Starting key discovery...");
  
  // 1. Try process.env (Vite define) - This is the standard way in AI Studio
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIza")) {
    console.log(`[GEMINI] Found valid key in process.env.GEMINI_API_KEY: ${process.env.GEMINI_API_KEY.substring(0, 4)}...`);
    return process.env.GEMINI_API_KEY;
  }
  if (process.env.API_KEY && process.env.API_KEY.startsWith("AIza")) {
    console.log(`[GEMINI] Found valid key in process.env.API_KEY: ${process.env.API_KEY.substring(0, 4)}...`);
    return process.env.API_KEY;
  }

  // 2. Try injected window variables (Fail-safe from server)
  if (typeof window !== 'undefined') {
    const win = window as any;
    const k = win.__GEMINI_API_KEY__ || win.GEMINI_API_KEY;
    if (k && k.startsWith("AIza")) {
      console.log(`[GEMINI] Found valid key in window scope: ${k.substring(0, 4)}...`);
      return k;
    }
  }

  // 3. Try Vite's import.meta.env
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (viteKey && viteKey.startsWith("AIza")) {
    console.log(`[GEMINI] Found valid key in import.meta.env: ${viteKey.substring(0, 4)}...`);
    return viteKey;
  }

  // 4. Fetch from backend
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    if (data.apiKey && data.apiKey.startsWith("AIza")) {
      console.log(`[GEMINI] Found valid key in /api/config: ${data.apiKey.substring(0, 4)}...`);
      return data.apiKey;
    }
  } catch (e) {}

  throw new Error("API Key is missing. Please select a valid Gemini API Key in the AI Studio Settings (sidebar).");
};

async function getAI() {
  if (!aiInstance) {
    const key = await getApiKey();
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export async function checkAIStatus() {
  const key = await getApiKey();
  const hasKey = !!key && key.startsWith("AIza");
  return { status: hasKey ? "online" : "offline", hasKey };
}

const PERSONA_PROMPTS = {
  teacher: (p: UserProfile) => `
    You are the CONCEPT ARCHITECT. Explain everything through the user's interests: ${p.interests.join(', ')}.
    MISSION: Use metaphors. Simplify for a ${p.studentClass} level student.
    DEPTH: ${p.learningDepth || 'Deep'}. STYLE: ${p.explanationStyle || 'Metaphorical'}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : 'English'}.
  `,
  coach: (p: UserProfile) => `
    You are the LOGIC COACH. Do NOT give answers. Ask guiding questions.
    INTERESTS: ${p.interests.join(', ')}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : 'English'}.
  `,
  trainer: (p: UserProfile) => `
    You are the SKILL TRAINER. Generate tasks based on interests: ${p.interests.join(', ')}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : 'English'}.
  `,
  genius: (p: UserProfile) => `
    You are the GENIUS LAB CORE AI. Build mental models.
    INTERESTS: ${p.interests.join(', ')}.
    STYLE: Engaging, 3D metaphors.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : 'English'}.
  `
};

export async function askThinkFlowAI(
  type: AIModelType,
  prompt: string,
  profile: UserProfile,
  history: Message[] = [],
  attachment?: { data: string; mimeType: string }
) {
  const ai = await getAI();
  if (!ai) throw new Error("API key is missing. Please provide a valid API key.");

  const systemInstruction = PERSONA_PROMPTS[type](profile);
  
  const contents: any[] = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const currentParts: any[] = [{ text: prompt }];
  if (attachment) {
    currentParts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
  }
  contents.push({ role: 'user', parts: currentParts });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: { 
        temperature: 0.7,
        systemInstruction
      }
    });
    return response.text || "No response";
  } catch (error: any) {
    console.error("AI Error:", error);
    throw error;
  }
}

export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const ai = await getAI();
  if (!ai) throw new Error("API key is missing. Please provide a valid API key.");

  const prompt = `
    Create a structured Knowledge Tree for: "${topic}".
    User: ${profile.age} years old, interests: ${profile.interests.join(', ')}.
    Return ONLY JSON:
    {
      "topic": "string",
      "nodes": [{ "id": "string", "label": "string", "description": "string", "metaphor": "string", "challenge": "string", "type": "core"|"branch"|"leaf" }],
      "connections": [{ "from": "id1", "to": "id2" }]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.8, 
        responseMimeType: "application/json" 
      }
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanJson) as KnowledgeTree;
  } catch (error: any) {
    console.error("Knowledge Tree Error:", error);
    throw error;
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const ai = await getAI();
  if (!ai) throw new Error("API key is missing. Please provide a valid API key.");

  const prompt = `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.8,
        systemInstruction: "Expert educator."
      }
    });
    return response.text || "Error";
  } catch (error: any) {
    console.error("Explanation Error:", error);
    throw error;
  }
}
