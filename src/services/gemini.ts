
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

const PERSONA_PROMPTS = {
  teacher: (p: UserProfile) => `
    You are the CONCEPT ARCHITECT in the ThinkFlow platform.
    PHILOSOPHY: Never give school-style definitions. Explain everything through the user's specific interests: ${p.interests.join(', ')}.
    MISSION: Use metaphors and storytelling. Simplify complex concepts for a ${p.studentClass} level student.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  coach: (p: UserProfile) => `
    You are the LOGIC COACH (Socratic Method) in ThinkFlow.
    MISSION: Do NOT give answers. Ask guiding questions to help the student reach the conclusion.
    RULES: If the student asks for a solution, refuse politely and ask a question that triggers their logic.
    INTERESTS: Connect your questions to their interests: ${p.interests.join(', ')}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  trainer: (p: UserProfile) => `
    You are the ADAPTIVE SKILL TRAINER in ThinkFlow.
    MISSION: Generate learning tasks based on user level and interests.
    LEVELS: Easy (foundational), Medium (application), Challenge (deep reasoning).
    EVALUATION: Evaluate the logic behind the student's answer, not just correctness.
    INTERESTS: Use their interests (${p.interests.join(', ')}) to make tasks engaging.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  genius: (p: UserProfile) => `
    You are the GENIUS LAB CORE AI.
    MISSION: You are a high-level knowledge architect. You don't just chat; you build mental models.
    INTERESTS: ${p.interests.join(', ')}.
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
  if (!process.env.GEMINI_API_KEY) {
    return "AI is currently unavailable. Please ensure the GEMINI_API_KEY is set in the platform settings.";
  }

  const systemInstruction = PERSONA_PROMPTS[type](profile);
  
  const contents: any[] = history.map(m => {
    const parts: any[] = [{ text: m.text }];
    if (m.attachment) {
      parts.push({ inlineData: { data: m.attachment.data, mimeType: m.attachment.mimeType } });
    }
    return { role: m.role, parts };
  });

  const currentParts: any[] = [{ text: prompt }];
  if (attachment) {
    currentParts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
  }

  contents.push({ role: 'user', parts: currentParts });

  try {
    const response: GenerateContentResponse = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: { systemInstruction, temperature: 0.7 }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "An error occurred while connecting to the AI. This might be due to an invalid API key or network issues.";
  }
}

/**
 * Generates a structured Knowledge Tree for the Genius Lab.
 */
export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API Key missing");
  }

  const prompt = `
    Create a structured Knowledge Tree for the topic: "${topic}".
    The tree should have 5-7 nodes that represent a learning path.
    Use the user's interests (${profile.interests.join(', ')}) to create metaphors for each node.
    
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
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.8,
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

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as KnowledgeTree;
  } catch (error) {
    console.error("Knowledge Tree Pro Error, trying Flash:", error);
    try {
      const response = await getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { 
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      return JSON.parse(text) as KnowledgeTree;
    } catch (flashError) {
      console.error("Knowledge Tree Flash Error:", flashError);
      throw new Error("Failed to generate Knowledge Tree. Please check your AI connection.");
    }
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
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.8,
        systemInstruction: "You are an expert educator who specializes in personalized learning through analogies."
      }
    });

    return response.text || "I couldn't generate an explanation for this topic.";
  } catch (error) {
    console.error("Gemini MVP Error:", error);
    throw new Error("Failed to connect to Gemini AI.");
  }
}
