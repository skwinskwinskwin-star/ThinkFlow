
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserProfile, Message, AIModelType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const PERSONA_PROMPTS = {
  teacher: (p: UserProfile) => `
    You are the CONCEPT TEACHER in the ThinkFlow platform.
    PHILOSOPHY: Never give school-style definitions. Explain everything through the user's specific interests: ${p.interests.join(', ')}.
    MISSION: Use metaphors and storytelling. Simplify complex concepts for a ${p.studentClass} level student.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  coach: (p: UserProfile) => `
    You are the THINKING COACH (Socratic Method) in ThinkFlow.
    MISSION: Do NOT give answers. Ask guiding questions to help the student reach the conclusion.
    RULES: If the student asks for a solution, refuse politely and ask a question that triggers their logic.
    INTERESTS: Connect your questions to their interests: ${p.interests.join(', ')}.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
  `,
  trainer: (p: UserProfile) => `
    You are the ADAPTIVE TRAINER in ThinkFlow.
    MISSION: Generate learning tasks based on user level and interests.
    LEVELS: Easy (foundational), Medium (application), Challenge (deep reasoning).
    EVALUATION: Evaluate the logic behind the student's answer, not just correctness.
    INTERESTS: Use their interests (${p.interests.join(', ')}) to make tasks engaging.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
    FORMAT: Use Markdown for formatting.
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
    return { role: m.role, parts };
  });

  const currentParts: any[] = [{ text: prompt }];
  if (attachment) {
    currentParts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
  }

  contents.push({ role: 'user', parts: currentParts });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: contents,
      config: { systemInstruction, temperature: 0.7 }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "An error occurred while connecting to the AI. Please try again.";
  }
}

/**
 * Specialized function for ThinkFlow's core feature: 
 * Explaining a topic based on specific interests.
 */
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
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
