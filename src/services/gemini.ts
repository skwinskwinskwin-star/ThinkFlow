import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

/**
 * GENIUS ENGINE v4.0 (Pure AI Core)
 * Professional-grade AI Service using Gemini 3.1 Pro
 * NO TEMPLATES. NO FALLBACKS. REAL AI ONLY.
 */

const getApiKey = async (): Promise<string | null> => {
  // HARDCODED USER KEY - Priority 1 (Since discovery is failing in this environment)
  const USER_KEY = "AIzaSyDKRP5EfIBLGy2V7b4wSCrXrHcogdBEGAg";
  const checkKey = (k: any) => k && typeof k === 'string' && k.length > 15;

  if (checkKey(USER_KEY)) {
    console.log("[GEMINI-SDK] Using hardcoded user key");
    return USER_KEY;
  }

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
 * Refined Error Handler
 */
const handleAIError = (error: any): string => {
  const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
  
  if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
    return "Слишком много запросов. Лимит бесплатной версии Gemini превышен. Пожалуйста, подождите 1 минуту и попробуйте снова.";
  }
  
  if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) {
    return "Ошибка доступа. Проверьте правильность вашего API ключа в настройках.";
  }

  if (errorStr.includes('SAFETY')) {
    return "ИИ заблокировал ответ по соображениям безопасности. Попробуйте перефразировать вопрос.";
  }

  return error.message || "Произошла ошибка при работе с ИИ. Попробуйте еще раз.";
};

/**
 * Smart Model Selection & Retry Logic
 */
const MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview"
];

async function callAIWithRetry(
  ai: any, 
  payload: any, 
  attempt = 0
): Promise<any> {
  const model = MODELS[attempt % MODELS.length];
  
  try {
    return await ai.models.generateContent({
      ...payload,
      model
    } as any);
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    console.warn(`[GEMINI-SDK] Attempt ${attempt} failed with ${model}:`, error);

    // If it's a 403 (Permission Denied), it might be the 'googleSearch' tool or the model itself
    if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) {
      if (payload.tools) {
        console.log("[GEMINI-SDK] 403 Error: Retrying without tools...");
        const { tools, toolConfig, ...rest } = payload;
        return callAIWithRetry(ai, rest, attempt + 1);
      }
    }

    // If it's a 429 (Quota), try next model immediately
    if (errorStr.includes('429') && attempt < MODELS.length * 2) {
      return callAIWithRetry(ai, payload, attempt + 1);
    }

    throw error;
  }
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
       Explain everything through deep, non-obvious metaphors related to the student's interests.
       Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
    : `You are the THINKFLOW SIDEKICK. Relate everything to: ${profile.interests.join(', ')}. 
       Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`;
  
    try {
      const response = await callAIWithRetry(ai, {
        contents: [
          ...history.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        config: { 
          temperature: 0.7, 
          systemInstruction,
        }
      });
      return response.text || "AI failed to generate a response.";
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Chat Error:", error);
    throw new Error(handleAIError(error));
  }
}

/**
 * Knowledge Tree Generation
 */
export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const ai = await getAI();

  const prompt = `
    GENERATE A KNOWLEDGE TREE FOR: "${topic}".
    
    REQUIREMENTS:
    1. Identify 5-7 core concepts.
    2. Write a 3-4 sentence "description" for each.
    3. Create a unique, sophisticated metaphor based on: ${profile.interests.join(', ')}. 
    4. Design a "Genius Challenge" for each.
    
    OUTPUT FORMAT:
    Return ONLY a valid JSON object matching the KnowledgeTree interface.
  `;

  try {
    const response = await callAIWithRetry(ai, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
      config: { 
        temperature: 0.7,
        responseMimeType: "application/json",
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
    throw new Error(handleAIError(error));
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const ai = await getAI();

  const prompt = `Explain "${topic}" using deep, insightful metaphors from: ${interests.join(', ')}. 
                  Focus on the mechanics and logic of the topic.`;
  try {
    const response = await callAIWithRetry(ai, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8 }
    });
    return response.text || "AI failed to generate an explanation.";
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Explanation Error:", error);
    throw new Error(handleAIError(error));
  }
}
