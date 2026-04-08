import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

// PROXY MODE: The key is hidden on the server.
// We call our own server endpoint which has the key.
async function callAIProxy(payload: any) {
  console.log(`[AI PROXY] Calling /api/ai/generate with payload:`, payload);
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  console.log(`[AI PROXY] Response status: ${response.status}`);
  console.log(`[AI PROXY] Content-Type: ${response.headers.get('content-type')}`);

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('AI Proxy returned non-JSON response:', text);
    throw new Error(`Server Error: Получен некорректный ответ от сервера (HTML вместо JSON). Пожалуйста, обновите страницу (F5).`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'AI Proxy Error');
  }
  
  return data;
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
    const result = await callAIProxy({
      model: "gemini-3-flash-preview",
      contents,
      config: { temperature: 0.7 },
      systemInstruction
    });
    return result.text || "No response";
  } catch (error: any) {
    console.error("AI Error:", error);
    return `Error: ${error.message}. Please ensure your API key is correctly set in Secrets.`;
  }
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

  try {
    const result = await callAIProxy({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8, responseMimeType: "application/json" }
    });

    const text = result.text || "";
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanJson) as KnowledgeTree;
  } catch (error: any) {
    console.error("Knowledge Tree Error:", error);
    throw new Error(`AI Error: ${error.message}`);
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const prompt = `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`;
  try {
    const result = await callAIProxy({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8 },
      systemInstruction: "Expert educator."
    });
    return result.text || "Error";
  } catch (error: any) {
    console.error("Explanation Error:", error);
    throw new Error(`AI Error: ${error.message}`);
  }
}
