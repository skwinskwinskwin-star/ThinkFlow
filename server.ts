import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("[SERVER] Booting ThinkFlow AI Proxy Server...");

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Starting ThinkFlow AI Proxy Server...`);
  
  app.use(cors());
  app.use(express.json());

  // 1. AI Proxy Route - MUST BE FIRST
  app.post("/api/ai/generate", async (req, res) => {
    console.log(`[AI PROXY] Request for model: ${req.body.model || 'default'}`);
    
    try {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY;
      
      if (!key) {
        console.error("[AI PROXY] ERROR: No API key found in Secrets!");
        return res.status(500).json({ error: "Ключ API не найден на сервере. Пожалуйста, добавьте GEMINI_API_KEY в меню Settings -> Secrets." });
      }

      const ai = new GoogleGenAI({ apiKey: key });
      const { model, contents, config, systemInstruction } = req.body;

      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents,
        config: {
          ...config,
          systemInstruction
        }
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("[AI PROXY] ERROR:", error.message || error);
      return res.status(500).json({ error: error.message || "Internal AI Error" });
    }
  });

  // 2. Diagnostic Route
  app.get("/api/health", (req, res) => {
    const hasKey = !!(process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY);
    res.json({ status: "online", hasKey, time: new Date().toISOString() });
  });

  // 3. Vite / Static Middleware
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
    console.log(`[SERVER] Static server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
