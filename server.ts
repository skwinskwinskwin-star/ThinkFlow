import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] ThinkFlow Engine v6.0 starting...`);
  
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---
  
  // Health check
  app.get("/api/health", (req, res) => {
    const key = process.env.GEMINI_API_KEY || process.env.AI_KEY || process.env.API_KEY;
    res.json({ 
      status: "online", 
      version: "6.0.0-robust-proxy",
      hasKey: !!key,
      keyPrefix: key ? key.substring(0, 4) : null,
      env: process.env.NODE_ENV || 'development'
    });
  });

  // AI Generation Proxy
  app.post("/api/ai/generate", async (req, res) => {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_KEY || process.env.API_KEY;

    if (!apiKey) {
      console.error("[SERVER] API Key missing in environment!");
      return res.status(500).json({ 
        error: "API_KEY_MISSING", 
        message: "API Key not found on server. Please add GEMINI_API_KEY to Secrets." 
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model || "gemini-2.0-flash-exp",
        contents,
        config
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[SERVER AI ERROR]", error);
      res.status(500).json({ 
        error: "AI_FAILED", 
        message: error.message || "Gemini API call failed" 
      });
    }
  });

  // --- VITE / STATIC ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Final version running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
