import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// GenAI helper (Modern SDK)
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey: key });
};

app.use(cors());
app.use(express.json());

// --- SECURE AI PROXY ROUTES ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    const ai = getGenAI();
    const { type, prompt, profile, history = [] } = req.body;
    
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const safeProfile = profile || { interests: ["science"], studentClass: "7th Grade", language: "ru" };
    const interests = Array.isArray(safeProfile.interests) ? safeProfile.interests : ["logic"];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || "") }]
        })).filter(m => m.parts[0].text),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: type === 'genius' 
          ? `You are the GENIUS LAB CORE. researcher. Student: ${safeProfile.studentClass}. Interests: ${interests.join(', ')}. MANDATORY: Use metaphors based on interests for every explanation. Respond in ${safeProfile.language === 'ru' ? 'Russian' : 'English'}.`
          : `ThinkFlow Sidekick. Interests: ${interests.join(', ')}. Use metaphors from interests. Respond in ${safeProfile.language === 'ru' ? 'Russian' : 'English'}.`
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ error: error.message || "Internal AI Error" });
  }
});

app.post("/api/ai/tree", async (req, res) => {
  try {
    const ai = getGenAI();
    const { topic, profile } = req.body;
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const safeProfile = profile || { interests: ["nature"], studentClass: "General", language: "ru" };
    const interests = Array.isArray(safeProfile.interests) ? safeProfile.interests : ["curiosity"];

    const prompt = `GENERATE A SCIENTIFIC KNOWLEDGE TREE FOR: "${topic}". 
    YOU MUST USE METAPHORS EXCLUSIVELY RELATED TO: ${interests.join(', ')}.
    
    CRITICAL INSTRUCTIONS: 
    1. CONCEPTION: Each concept must have a vivid metaphor from the interests.
    2. THE CHALLENGE: This is now a SPECIFIC SCIENTIFIC PROBLEM or EQUATION. 
       - It must have a CLEAR, SINGLE correct answer (numeric value or specific scientific term).
       - Examples: "Calculate the force if m=10, a=5", "What is the chemical symbol for Helium?", "Solve for x in 2x+5=15".
       - DO NOT ask for "explanations". Ask for "results".
    3. Add a 'points' field (integer 50-200).

    Return ONLY JSON:
    {
      "topic": "${topic}",
      "nodes": [
        { 
          "id": "n1", 
          "label": "Concept Name", 
          "description": "Scientific context", 
          "metaphor": "Vivid interest-based metaphor", 
          "challenge": "The specific problem to solve", 
          "points": 100, 
          "type": "core" 
        }
      ],
      "connections": [{ "from": "n1", "to": "n2" }]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("AI Proxy Tree Error:", error);
    res.status(500).json({ error: error.message || "Internal AI Error" });
  }
});

app.post("/api/ai/verify", async (req, res) => {
  try {
    const ai = getGenAI();
    const { task, answer, profile } = req.body;
    
    if (!answer) return res.status(400).json({ error: "Answer is required" });

    const prompt = `SCIENTIFIC VERIFICATION PROTOCOL (OBJECTIVE MODE)
    
    PROBLEM: ${task.challenge || task.description}
    STUDENT ANSWER: "${answer}"
    
    YOUR ROLE:
    1. Solve the problem yourself with absolute precision.
    2. Check the student's numerical value AND units (if applicable).
    3. Allow for minor rounding differences (e.g., 3.14 vs 3.14159) but be strict on the core logic.
    4. Reject vague explanations. Expect the specific RESULT.
    
    Return ONLY JSON:
    {
      "isCorrect": boolean,
      "feedback": "Concise scientific feedback (1 sentence). If wrong, briefly mention why.",
      "bonusXP": number (0-20, only for perfect and elegant solutions)
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/api/health", (req, res) => {
  try {
    const ai = getGenAI();
    res.json({ status: "online", keyLoaded: true, env: process.env.NODE_ENV });
  } catch (e) {
    res.json({ status: "key_missing", keyLoaded: false, env: process.env.NODE_ENV });
  }
});

// Important for Vercel: Export the app
export default app;

// Vite / Static Middleware
if (process.env.NODE_ENV !== "production") {
  // Use dynamic import only for dev to avoid bundling 'vite' in production
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER] Dev running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to load Vite:", err);
  });
} else if (!process.env.VERCEL) {
  // Production server but NOT on Vercel
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Production listening on port ${PORT}`);
  });
}

// Remove startServer().catch() as it is no longer defined.
// The app is already listening inside the conditional blocks above.
