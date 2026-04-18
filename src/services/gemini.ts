import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

/**
 * GENIUS ENGINE v5.0 (Secure Proxy Layer)
 * NO DIRECT API CALLS. ALL DATA PROXIED VIA SERVER.
 */

async function callServerAI(endpoint: string, payload: any): Promise<any> {
  try {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Server AI Error");
    return data;
  } catch (error: any) {
    if (error.message.includes('Key')) throw new Error("ИИ временно недоступен (ошибка ключа на сервере).");
    if (error.message.includes('429')) throw new Error("Слишком много запросов. Подождите 1 минуту.");
    throw error;
  }
}

export async function askThinkFlowAI(
  type: AIModelType,
  prompt: string,
  profile: UserProfile,
  history: Message[] = [],
  _attachment?: any
) {
  const result = await callServerAI('chat', { type, prompt, profile, history });
  return result.text || "AI failed to generate a response.";
}

export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  return await callServerAI('tree', { topic, profile });
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const result = await callServerAI('chat', {
    type: 'coach',
    prompt: `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`,
    profile: { language: 'ru', interests, studentClass: '9A' },
    history: []
  });
  return result.text;
}

export function isLocalMode() {
  return false; 
}
