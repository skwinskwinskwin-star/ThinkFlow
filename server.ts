import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import * as dotenv from "dotenv";

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
  const key = getPrivateApiKey();
  if (!key) return res.status(500).json({ error: "AI Key not configured on server" });

  const { type, prompt, profile, history } = req.body;
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: type === 'genius' 
        ? `You are the GENIUS LAB CORE. world-class researcher. Student: ${profile.studentClass}. Interests: ${profile.interests.join(', ')}. Metaphors based on interests. Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
        : `ThinkFlow Sidekick. Interests: ${profile.interests.join(', ')}. Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
    });

    const result = await model.generateContent({
      contents: [
        ...history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });

    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/tree", async (req, res) => {
  const key = getPrivateApiKey();
  if (!key) return res.status(500).json({ error: "AI Key not configured on server" });

  const { topic, profile } = req.body;
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `GENERATE A KNOWLEDGE TREE FOR: "${topic}". 5-7 core concepts explained via Metaphors of: ${profile.interests.join(', ')}. Return ONLY JSON.`;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    res.json(JSON.parse(result.response.text()));
  } catch (error: any) {
    console.error("AI Proxy Tree Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "online", keyLoaded: !!getPrivateApiKey() });
});

// Important for Vercel: Export the app
export default app;

// Vite / Static Middleware
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  
  app.use(vite.middlewares);
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
} else if (!process.env.VERCEL) {
  // Production server but NOT on Vercel
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
}

// Remove startServer().catch() as it is no longer defined.
// The app is already listening inside the conditional blocks above.
