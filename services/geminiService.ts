
// @google/genai SDK used for educational AI personas
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserProfile, Message, AIModelType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PERSONA_PROMPTS = {
  teacher: (p: UserProfile) => `
    You are the CONCEPT TEACHER in the ThinkFlow platform.
    PHILOSOPHY: Never give school-style definitions. Explain everything through the user's specific interests: ${p.interests.join(', ')}.
    MISSION: Use metaphors and storytelling. Simplify complex concepts for a ${p.studentClass} level student.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
  `,
  coach: (p: UserProfile) => `
    You are the THINKING COACH (Socratic Method) in ThinkFlow.
    MISSION: Do NOT give answers. Ask guiding questions to help the student reach the conclusion.
    RULES: If the student asks for a solution, refuse politely and ask a question that triggers their logic.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
  `,
  trainer: (p: UserProfile) => `
    You are the ADAPTIVE TRAINER in ThinkFlow.
    MISSION: Generate learning tasks based on user level and interests.
    LEVELS: Easy (foundational), Medium (application), Challenge (deep reasoning).
    EVALUATION: Evaluate the logic behind the student's answer, not just correctness.
    LANGUAGE: Respond in ${p.language === 'ru' ? 'Russian' : p.language === 'uz' ? 'Uzbek' : 'English'}.
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

  // Use gemini-3-pro-preview for advanced pedagogical reasoning
  // Ensuring response handling follows property access rules
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: { systemInstruction, temperature: 0.8 }
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
}
