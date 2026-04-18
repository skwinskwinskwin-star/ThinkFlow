import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Private Key Helper (Server-side ONLY)
const getPrivateApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.API_KEY || "";
};

app.use(cors());
app.use(express.json());

// --- SECURE AI PROXY ROUTES ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    const key = getPrivateApiKey();
    if (!key) return res.status(500).json({ error: "AI Key not configured on server" });

    const { type, prompt, profile, history = [] } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const safeProfile = profile || { interests: ["science"], studentClass: "7th Grade", language: "ru" };
    const interests = Array.isArray(safeProfile.interests) ? safeProfile.interests : ["logic"];

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: type === 'genius' 
        ? `You are the GENIUS LAB CORE. researcher. Student: ${safeProfile.studentClass}. Interests: ${interests.join(', ')}. Metaphors based on interests. Respond in ${safeProfile.language === 'ru' ? 'Russian' : 'English'}.`
        : `ThinkFlow Sidekick. Interests: ${interests.join(', ')}. Respond in ${safeProfile.language === 'ru' ? 'Russian' : 'English'}.`
    });

    const result = await model.generateContent({
      contents: [
        ...history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || "") }]
        })).filter(m => m.parts[0].text),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });

    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ error: error.message || "Internal AI Error" });
  }
});

app.post("/api/ai/tree", async (req, res) => {
  try {
    const key = getPrivateApiKey();
    if (!key) return res.status(500).json({ error: "AI Key not configured on server" });

    const { topic, profile } = req.body;
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const safeProfile = profile || { interests: ["nature"], studentClass: "General", language: "ru" };
    const interests = Array.isArray(safeProfile.interests) ? safeProfile.interests : ["curiosity"];

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `GENERATE A KNOWLEDGE TREE FOR: "${topic}". 5-7 core concepts explained via Metaphors of: ${interests.join(', ')}. Return ONLY JSON in this format: { "topic": string, "concepts": [ { "name": string, "metaphor": string, "explanation": string } ] }`;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = result.response.text();
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("AI Proxy Tree Error:", error);
    res.status(500).json({ error: error.message || "Internal AI Error" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "online", keyLoaded: !!getPrivateApiKey(), env: process.env.NODE_ENV });
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
