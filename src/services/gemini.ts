import { GoogleGenAI } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

// Initialize Gemini directly in the frontend as per system guidelines.
let aiInstance: any = null;
let cachedKey: string | null = null;

const getApiKey = async () => {
  if (cachedKey) return cachedKey;
  
  console.log("[GEMINI] Starting robust key discovery...");
  
  const sources = [
    { name: "process.env.API_KEY", val: process.env.API_KEY },
    { name: "process.env.GEMINI_API_KEY", val: process.env.GEMINI_API_KEY },
    { name: "window.__GEMINI_API_KEY__", val: (window as any).__GEMINI_API_KEY__ },
    { name: "window.GEMINI_API_KEY", val: (window as any).GEMINI_API_KEY },
    { name: "import.meta.env.VITE_GEMINI_API_KEY", val: (import.meta as any).env?.VITE_GEMINI_API_KEY }
  ];

  // First pass: look for something that looks like a real key
  for (const source of sources) {
    const k = source.val;
    if (k && typeof k === 'string' && k.length > 20 && k.startsWith("AIza")) {
      console.log(`[GEMINI] Found valid-looking key in ${source.name}`);
      cachedKey = k;
      return k;
    }
  }

  // Second pass: try dynamic fetch from server with cache buster
  try {
    console.log("[GEMINI] Attempting dynamic fetch from /api/config...");
    const response = await fetch(`/api/config?t=${Date.now()}`);
    const data = await response.json();
    if (data.apiKey && data.apiKey.length > 20) {
      console.log(`[GEMINI] Found key via dynamic fetch: ${data.apiKey.substring(0, 4)}...`);
      cachedKey = data.apiKey;
      return data.apiKey;
    }
  } catch (e) {
    console.warn("[GEMINI] Dynamic fetch failed");
  }

  // Third pass: use anything that is long enough
  for (const source of sources) {
    const k = source.val;
    if (k && typeof k === 'string' && k.length > 10) {
      console.log(`[GEMINI] Using fallback key from ${source.name} (length: ${k.length})`);
      cachedKey = k;
      return k;
    }
  }

  throw new Error("API Key is missing. Please ensure API_KEY is set in Settings and refresh the page.");
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
  const hasKey = !!key && key.length > 10;
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
