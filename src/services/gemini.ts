import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

async function callServerAI(model: string, contents: any[], config: any) {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, contents, config })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response from server:", text);
      throw new Error("Server returned an invalid response (HTML). This usually means the API route is not working.");
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Server error: ${response.status}`);
    }

    return data.text;
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    throw error;
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
    return await callServerAI('gemini-1.5-flash', contents, { 
      systemInstruction,
      temperature: 0.7 
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return `Error: ${error.message}. Please check your connection and API key in Settings.`;
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
    const text = await callServerAI('gemini-1.5-flash', [{ role: 'user', parts: [{ text: prompt }] }], { 
      temperature: 0.8,
      responseMimeType: "application/json"
    });

    if (!text) throw new Error("Empty response from AI");
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanJson) as KnowledgeTree;
  } catch (error: any) {
    throw new Error(`AI Error: ${error.message}`);
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const prompt = `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`;
  try {
    return await callServerAI('gemini-1.5-flash', [{ role: 'user', parts: [{ text: prompt }] }], { 
      temperature: 0.8,
      systemInstruction: "Expert educator."
    });
  } catch (error: any) {
    throw new Error(`AI Error: ${error.message}`);
  }
}
