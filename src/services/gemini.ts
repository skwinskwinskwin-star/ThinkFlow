import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

// This service now proxies all requests to the backend server
// to ensure API key security and reliability.

export async function checkAIStatus() {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    return { status: data.status === 'ready' ? "online" : "offline", hasKey: data.hasKey };
  } catch (e) {
    return { status: "offline", hasKey: false };
  }
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

async function callAIProxy(model: string, contents: any[], config?: any) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, contents, config })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Server Error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

export async function askThinkFlowAI(
  type: AIModelType,
  prompt: string,
  profile: UserProfile,
  history: Message[] = [],
  attachment?: { data: string; mimeType: string }
) {
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

  return await callAIProxy("gemini-3-flash-preview", contents, {
    temperature: 0.7,
    systemInstruction
  });
}

export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
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

  const text = await callAIProxy("gemini-3-flash-preview", [{ role: 'user', parts: [{ text: prompt }] }], {
    temperature: 0.8,
    responseMimeType: "application/json"
  });

  const cleanJson = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(cleanJson) as KnowledgeTree;
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const prompt = `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`;
  return await callAIProxy("gemini-3-flash-preview", [{ role: 'user', parts: [{ text: prompt }] }], {
    temperature: 0.8,
    systemInstruction: "Expert educator."
  });
}
