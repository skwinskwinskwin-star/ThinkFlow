import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

/**
 * GENIUS ENGINE v2.0
 * Professional-grade AI Service for ThinkFlow
 */

let aiInstance: any = null;
let cachedKey: string | null = null;

/**
 * Robust API Key Discovery
 * Checks multiple layers of injection and fallbacks
 */
const getApiKey = async (): Promise<string> => {
  if (cachedKey) return cachedKey;

  console.log("[GENIUS-ENGINE] Initiating key discovery sequence...");

  const checkKey = (k: any) => k && typeof k === 'string' && k.length > 15;

  // 1. Check window injection (from server.ts /gemini-config.js)
  if (typeof window !== 'undefined') {
    const win = window as any;
    const injectedKey = win.__GEMINI_API_KEY__ || win.GEMINI_API_KEY;
    if (checkKey(injectedKey)) {
      console.log("[GENIUS-ENGINE] Key found in window scope.");
      cachedKey = injectedKey;
      return injectedKey;
    }
  }

  // 2. Check process.env (Safely)
  try {
    const envKey = (typeof process !== 'undefined' && process.env) ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : null;
    if (checkKey(envKey)) {
      console.log("[GENIUS-ENGINE] Key found in process.env.");
      cachedKey = envKey as string;
      return envKey as string;
    }
  } catch (e) {
    // process.env not available
  }

  // 3. Dynamic fetch from server (Last resort, cache-busted)
  try {
    console.log("[GENIUS-ENGINE] Attempting live fetch from server...");
    const response = await fetch(`/api/config?t=${Date.now()}`);
    const data = await response.json();
    if (checkKey(data.apiKey)) {
      console.log("[GENIUS-ENGINE] Key retrieved from /api/config.");
      cachedKey = data.apiKey;
      return data.apiKey;
    }
  } catch (e) {
    console.warn("[GENIUS-ENGINE] Server fetch failed.");
  }

  throw new Error("CRITICAL: Gemini API Key not found. Please check your AI Studio Settings.");
};

/**
 * Get or initialize the AI instance
 */
async function getAI() {
  if (!aiInstance) {
    const key = await getApiKey();
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export async function checkAIStatus() {
  try {
    const key = await getApiKey();
    return { status: "online", hasKey: !!key };
  } catch (e) {
    return { status: "offline", hasKey: false };
  }
}

/**
 * System Personas with advanced engineering prompts
 */
const SYSTEM_INSTRUCTIONS = {
  genius: (p: UserProfile) => `
    You are the GENIUS LAB CORE. You are a world-class educator and cognitive scientist.
    Your goal is to build a "Knowledge Tree" that maps out a complex topic for a student.
    
    CONTEXT:
    - Student Age/Level: ${p.studentClass} (${p.age} years old)
    - Interests (Use as Metaphors): ${p.interests.join(', ')}
    - Learning Depth: ${p.learningDepth}
    - Style: ${p.explanationStyle}
    
    CORE DIRECTIVE:
    - Use the student's interests as the primary vehicle for explanation.
    - If they like "Gaming", explain variables as "Inventory Slots".
    - If they like "Cooking", explain algorithms as "Recipes".
    - Be encouraging, high-energy, and intellectually stimulating.
    - Respond in ${p.language === 'ru' ? 'Russian' : 'English'}.
  `,
  chat: (p: UserProfile) => `
    You are the THINKFLOW SIDEKICK. You are a helpful, witty, and brilliant AI tutor.
    You help the student navigate their Knowledge Tree.
    
    USER PROFILE:
    - Interests: ${p.interests.join(', ')}
    - Level: ${p.studentClass}
    
    GUIDELINES:
    - Always relate answers back to the user's interests.
    - Keep explanations concise but deep.
    - Use formatting (bold, lists) for readability.
    - Respond in ${p.language === 'ru' ? 'Russian' : 'English'}.
  `
};

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
  const systemInstruction = type === 'genius' ? SYSTEM_INSTRUCTIONS.genius(profile) : SYSTEM_INSTRUCTIONS.chat(profile);
  
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
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Chat Error:", error);
    throw error;
  }
}

/**
 * Knowledge Tree Generation
 * Uses structured output for 100% reliability
 */
export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const ai = await getAI();
  
  const systemInstruction = SYSTEM_INSTRUCTIONS.genius(profile);
  const prompt = `
    GENERATE A KNOWLEDGE TREE FOR: "${topic}".
    
    The tree must consist of 5-7 nodes that represent a logical progression from basic to advanced concepts.
    Each node MUST have:
    1. label: A clear name for the concept.
    2. description: A clear explanation (2-3 sentences).
    3. metaphor: A brilliant metaphor based on the user's interests (${profile.interests.join(', ')}).
    4. challenge: A small "Genius Challenge" (task) for the user to prove they understood the concept.
    5. type: "core" (the foundation), "branch" (main concepts), or "leaf" (specific details).

    RETURN ONLY A VALID JSON OBJECT.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.8,
        systemInstruction,
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

    const result = JSON.parse(response.text);
    return result as KnowledgeTree;
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Tree Generation Error:", error);
    throw new Error("Failed to architect knowledge tree. Please try a different topic or check your connection.");
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const ai = await getAI();
  const prompt = `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.8,
        systemInstruction: "You are a world-class educator who simplifies complex topics using creative metaphors."
      }
    });
    return response.text || "I couldn't generate an explanation.";
  } catch (error: any) {
    console.error("[GENIUS-ENGINE] Explanation Error:", error);
    throw error;
  }
}
