import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

/**
 * GENIUS ENGINE v4.0 (Pure AI Core)
 * Professional-grade AI Service using Gemini 3.1 Pro
 * NO TEMPLATES. NO FALLBACKS. REAL AI ONLY.
 */

const getApiKey = async (): Promise<string | null> => {
  const checkKey = (k: any) => k && typeof k === 'string' && k.length > 15;

  // 1. Check Process Env (Vite Define)
  const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (checkKey(envKey)) {
    console.log("[GEMINI-SDK] Key found in process.env");
    return envKey as string;
  }

  // 2. Check Meta Tag
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="gemini-api-key"]');
    const metaKey = meta?.getAttribute('content');
    if (checkKey(metaKey)) {
      console.log("[GEMINI-SDK] Key found in meta tag");
      return metaKey as string;
    }
  }

  // 3. Check Window Injection
  if (typeof window !== 'undefined') {
    const win = window as any;
    const injectedKey = win.__GEMINI_API_KEY__ || win.GEMINI_API_KEY;
    if (checkKey(injectedKey)) {
      console.log("[GEMINI-SDK] Key found in window object");
      return injectedKey;
    }
  }

  // 4. Server Fetch Fallback
  try {
    const response = await fetch(`/api/config?t=${Date.now()}`);
    const data = await response.json();
    if (checkKey(data.apiKey)) {
      console.log("[GEMINI-SDK] Key found via server fetch");
      return data.apiKey;
    }
  } catch (e) {
    console.error("[GEMINI-SDK] Server fetch failed:", e);
  }

  console.error("[GEMINI-SDK] CRITICAL: No API key found in any source!");
  return null;
};

const getAI = async () => {
  const key = await getApiKey();
  if (!key) {
    throw new Error("API Key not found. Please add your Gemini API Key in the Settings (gear icon) to enable Real AI Research.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export function isLocalMode() {
  // We'll check this asynchronously in components if needed, 
  // but for now, we assume we want AI.
  return false; 
}

/**
 * Main Chat Function
 */
export async function askThinkFlowAI(
  type: AIModelType,
  prompt: string,
  profile: UserProfile,
  history: Message[] = [],
  attachment?: { data: string; mimeType: string }
) {
  const ai = await getAI();
  
  const systemInstruction = type === 'genius' 
    ? `You are the GENIUS LAB CORE. You are a world-class researcher. 
       Student: ${profile.studentClass}. Interests: ${profile.interests.join(', ')}. 
       MANDATORY: Use Google Search to find the latest data. 
       Explain everything through deep, non-obvious metaphors related to the student's interests.
       Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
    : `You are the THINKFLOW SIDEKICK. Relate everything to: ${profile.interests.join(', ')}. 
       Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: { 
        temperature: 0.7, 
        systemInstruction,
        tools: [{ googleSearch: {} }] as any,
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });
    return response.text || "AI failed to generate a response.";
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Chat Error:", error);
    throw error;
  }
}

/**
 * Knowledge Tree Generation
 * Uses Google Search grounding for real-time research.
 */
export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const ai = await getAI();

  const prompt = `
    PERFORM DEEP INTERNET RESEARCH AND GENERATE A KNOWLEDGE TREE FOR: "${topic}".
    
    RESEARCH REQUIREMENTS:
    1. Use Google Search to find the most recent, accurate, and advanced information about "${topic}".
    2. Identify 5-7 concepts that represent the "frontier" of knowledge in this field.
    3. For each concept, write a 3-4 sentence "description" that explains the concept's mechanism and importance.
    4. Create a unique, sophisticated metaphor based on: ${profile.interests.join(', ')}. 
       The metaphor must explain HOW the concept works, not just mention the interest.
    5. Design a "Genius Challenge" that requires applying the concept to a real-world problem in ${profile.interests[0]}.
    
    OUTPUT FORMAT:
    Return ONLY a valid JSON object matching the KnowledgeTree interface.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.7,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }] as any,
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
    console.error("[GENIUS-ENGINE] Tree Generation Error:", error);
    throw error;
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const ai = await getAI();

  const prompt = `Explain "${topic}" using deep, insightful metaphors from: ${interests.join(', ')}. 
                  Focus on the mechanics and logic of the topic.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8 }
    });
    return response.text || "AI failed to generate an explanation.";
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Explanation Error:", error);
    throw error;
  }
}
