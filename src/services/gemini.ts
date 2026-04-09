import { GoogleGenAI } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

// Initialize Gemini directly in the frontend as per system guidelines.
let aiInstance: any = null;
let cachedKey: string | null = null;

const getApiKey = async () => {
  console.log("[GEMINI] Starting API key retrieval...");
  
  // 1. Try process.env (Vite define)
  let key = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  console.log("[GEMINI] Step 1 (process.env):", key ? `FOUND (${key.substring(0, 4)}...)` : "MISSING");
  if (key && key.startsWith("AIza") && key !== "MY_GEMINI_API_KEY") return key;

  // 2. Try cached key
  if (cachedKey) {
    console.log("[GEMINI] Step 2 (cache): FOUND");
    return cachedKey;
  }

  // 3. Fetch from backend
  console.log("[GEMINI] Step 3: Fetching from /api/config...");
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    console.log("[GEMINI] Backend response:", data.hasKey ? "HAS KEY" : "NO KEY");
    if (data.apiKey && data.apiKey.startsWith("AIza")) {
      cachedKey = data.apiKey;
      return data.apiKey;
    }
  } catch (e) {
    console.error("[GEMINI] Backend fetch failed:", e);
  }

  // 4. Last resort: try to find any key in the environment that looks real
  console.log("[GEMINI] Step 4: Last resort check...");
  // This is a bit of a hack but we're desperate
  for (const k in process.env) {
    const val = (process.env as any)[k];
    if (val && typeof val === 'string' && val.startsWith('AIza')) {
      console.log(`[GEMINI] Found key in process.env.${k}`);
      return val;
    }
  }

  console.error("[GEMINI] All retrieval steps failed.");
  return "";
};

async function getAI() {
  if (!aiInstance) {
    const key = await getApiKey();
    if (!key) {
      console.error("Gemini API Key is missing or invalid.");
      return null;
    }
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
