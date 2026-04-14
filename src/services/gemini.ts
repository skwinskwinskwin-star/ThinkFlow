import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";
import { generateLocalKnowledgeTree, getLocalChatResponse } from "./localEngine";

/**
 * GENIUS ENGINE v3.0 (Hybrid Core)
 * Professional-grade AI Service with Local Heuristic Fallback
 */

let aiInstance: any = null;
export let cachedKey: string | null = null;

/**
 * Robust API Key Discovery
 */
const getApiKey = async (): Promise<string | null> => {
  if (cachedKey) return cachedKey;

  const checkKey = (k: any) => k && typeof k === 'string' && k.length > 15;

  // 1. Check Meta Tag (Highest priority)
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="gemini-api-key"]');
    const metaKey = meta?.getAttribute('content');
    if (checkKey(metaKey)) {
      console.log("[GENIUS-ENGINE] Key found in meta tag.");
      cachedKey = metaKey as string;
      return metaKey as string;
    }
  }

  if (typeof window !== 'undefined') {
    const win = window as any;
    const injectedKey = win.__GEMINI_API_KEY__ || win.GEMINI_API_KEY;
    if (checkKey(injectedKey)) {
      cachedKey = injectedKey;
      return injectedKey;
    }
  }

  try {
    const envKey = (typeof process !== 'undefined' && process.env) ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : null;
    if (checkKey(envKey)) {
      cachedKey = envKey as string;
      return envKey as string;
    }
  } catch (e) {}

  try {
    const response = await fetch(`/api/config?t=${Date.now()}`);
    const data = await response.json();
    if (checkKey(data.apiKey)) {
      cachedKey = data.apiKey;
      return data.apiKey;
    }
  } catch (e) {}

  return null;
};

async function getAI() {
  if (!aiInstance) {
    const key = await getApiKey();
    if (key) {
      aiInstance = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiInstance;
}

export function isLocalMode() {
  return !cachedKey;
}

/**
 * Main Chat Function with Local Fallback
 */
export async function askThinkFlowAI(
  type: AIModelType,
  prompt: string,
  profile: UserProfile,
  history: Message[] = [],
  attachment?: { data: string; mimeType: string }
) {
  const ai = await getAI();
  
  if (!ai) {
    console.log("[GENIUS-ENGINE] API Key missing, using Local Heuristic Engine...");
    return getLocalChatResponse(prompt, profile);
  }

  const systemInstruction = type === 'genius' 
    ? `You are the GENIUS LAB CORE. Student: ${profile.studentClass}. Interests: ${profile.interests.join(', ')}. Use Google Search to provide accurate, real-world information. Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
    : `You are the THINKFLOW SIDEKICK. Relate everything to: ${profile.interests.join(', ')}. Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`;
  
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
      tools: [{ googleSearch: {} }],
      config: { 
        temperature: 0.7, 
        systemInstruction,
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.warn("[GENIUS-ENGINE] Chat API Error:", error);
    return getLocalChatResponse(prompt, profile);
  }
}

/**
 * Knowledge Tree Generation with Local Fallback
 * Now includes Google Search grounding for "Internet Research"
 */
export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const ai = await getAI();
  
  if (!ai) {
    console.log("[GENIUS-ENGINE] API Key missing, using Local Heuristic Engine for Tree...");
    return generateLocalKnowledgeTree(topic, profile);
  }

  const prompt = `
    RESEARCH AND GENERATE A COMPREHENSIVE KNOWLEDGE TREE FOR: "${topic}".
    
    INSTRUCTIONS:
    1. Use Google Search to find the most up-to-date and accurate information about this topic.
    2. Identify 5-7 critical concepts.
    3. For each concept, the "description" MUST be a detailed, 2-3 sentence explanation of the concept itself.
    4. Create a brilliant metaphor based on the user's interests: ${profile.interests.join(', ')}.
    5. Design a "Genius Challenge" for each node.
    
    RETURN ONLY A VALID JSON OBJECT.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      config: { 
        temperature: 0.7,
        responseMimeType: "application/json",
        toolConfig: { includeServerSideToolInvocations: true },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  metaphor: { type: Type.STRING },
                  challenge: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["core", "branch", "leaf"] }
                },
                required: ["id", "label", "description", "metaphor", "challenge", "type"]
              }
            },
            connections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  from: { type: Type.STRING },
                  to: { type: Type.STRING }
                },
                required: ["from", "to"]
              }
            }
          },
          required: ["topic", "nodes", "connections"]
        }
      }
    });

    return JSON.parse(response.text) as KnowledgeTree;
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] CRITICAL AI ERROR:", error);
    return generateLocalKnowledgeTree(topic, profile);
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const ai = await getAI();
  if (!ai) return `Explanation for ${topic} using ${interests.join(', ')} (Local Mode)`;

  const prompt = `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8 }
    });
    return response.text || "I couldn't generate an explanation.";
  } catch (error: any) {
    return `Explanation for ${topic} using ${interests.join(', ')} (Local Fallback)`;
  }
}
