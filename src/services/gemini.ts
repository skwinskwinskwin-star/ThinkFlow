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
      console.error("Non-JSON response:", text);
      throw new Error("AI Server returned HTML instead of JSON. This is a routing error.");
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
    You are the CONCEPT ARCHITECT in the ThinkFlow platform.
    PHILOSOPHY: Never give school-style definitions. Explain everything through the user's specific interests: ${p.interests.join(', ')}.
    MISSION: Use metaphors and storytelling. Simplify complex concepts for a ${p.studentClass} level student.
    DEPTH: Your explanation depth is ${p.learningDepth || 'Deep'}.
    STYLE: Your explanation style is ${p.explanationStyle || 'Metaphorical'}.
    GENIUS MODE: ${p.geniusMode ? 'ENABLED (Use advanced reasoning and multi-layered metaphors)' : 'DISABLED'}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  coach: (p: UserProfile) => `
    You are the LOGIC COACH (Socratic Method) in ThinkFlow.
    MISSION: Do NOT give answers. Ask guiding questions to help the student reach the conclusion.
    RULES: If the student asks for a solution, refuse politely and ask a question that triggers their logic.
    INTERESTS: Connect your questions to their interests: ${p.interests.join(', ')}.
    DEPTH: Your questioning depth is ${p.learningDepth || 'Deep'}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  trainer: (p: UserProfile) => `
    You are the ADAPTIVE SKILL TRAINER in ThinkFlow.
    MISSION: Generate learning tasks based on user level and interests.
    LEVELS: Easy (foundational), Medium (application), Challenge (deep reasoning).
    EVALUATION: Evaluate the logic behind the student's answer, not just correctness.
    INTERESTS: Use their interests (${p.interests.join(', ')}) to make tasks engaging.
    DEPTH: Task complexity is ${p.learningDepth || 'Deep'}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  genius: (p: UserProfile) => `
    You are the GENIUS LAB CORE AI.
    MISSION: You are a high-level knowledge architect. You don't just chat; you build mental models.
    INTERESTS: ${p.interests.join(', ')}.
    DEPTH: Your architectural depth is ${p.learningDepth || 'Deep'}.
    STYLE: Your architectural style is ${p.explanationStyle || 'Metaphorical'}.
    GENIUS MODE: ${p.geniusMode ? 'ENABLED (Use quantum-level metaphors and hyper-advanced logic)' : 'DISABLED'}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
    STYLE: Be highly engaging, use 3D metaphors, and make the student feel like a genius.
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
  
  const contents: any[] = history.map(m => {
    const parts: any[] = [{ text: m.text }];
    if (m.attachment) {
      parts.push({ inlineData: { data: m.attachment.data, mimeType: m.attachment.mimeType } });
    }
    return { role: m.role === 'user' ? 'user' : 'model', parts };
  });

  const currentParts: any[] = [{ text: prompt }];
  if (attachment) {
    currentParts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
  }

  contents.push({ role: 'user', parts: currentParts });

  try {
    return await callServerAI('gemini-3-flash-preview', contents, { 
      systemInstruction,
      temperature: 0.7 
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return `Error: ${error.message || "Failed to connect to AI"}. Please check your connection.`;
  }
}

export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const prompt = `
    Create a structured Knowledge Tree for the topic: "${topic}".
    The user is ${profile.age} years old and interested in: ${profile.interests.join(', ')}.
    
    Return a JSON object with this structure:
    {
      "topic": "string",
      "nodes": [
        {
          "id": "string",
          "label": "string (short name)",
          "description": "string (educational explanation)",
          "metaphor": "string (metaphor based on user interests)",
          "challenge": "string (a small task or question)",
          "type": "core" | "branch" | "leaf"
        }
      ],
      "connections": [
        { "from": "id1", "to": "id2" }
      ]
    }
    
    IMPORTANT: Return ONLY the JSON object. No markdown formatting.
  `;

  try {
    const text = await callServerAI('gemini-3-flash-preview', [{ role: 'user', parts: [{ text: prompt }] }], { 
      temperature: 0.8,
      responseMimeType: "application/json"
    });

    if (!text) throw new Error("Empty response from AI");
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanJson) as KnowledgeTree;
  } catch (error: any) {
    console.error("Knowledge Tree Error:", error);
    throw new Error(`AI Connection Error: ${error.message || "Failed to generate knowledge tree"}.`);
  }
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  const prompt = `
    Explain the topic: "${topic}" 
    Using these interests as metaphors and examples: ${interests.join(', ')}.
    
    Guidelines:
    1. Be educational but highly engaging.
    2. Use the interests to create a coherent narrative or set of analogies.
    3. Break down complex parts of the topic into simple, relatable concepts.
    4. Use Markdown for clear formatting (headers, bold text, lists).
  `;

  try {
    return await callServerAI('gemini-3-flash-preview', [{ role: 'user', parts: [{ text: prompt }] }], { 
      temperature: 0.8,
      systemInstruction: "You are an expert educator who specializes in personalized learning through analogies."
    });
  } catch (error: any) {
    console.error("Explanation Error:", error);
    throw new Error(`AI Error: ${error.message || "Failed to connect to Gemini AI"}.`);
  }
}
