import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Starting ThinkFlow AI Proxy Server...`);
  
  app.use(cors());
  app.use(express.json());

  // 1. AI Proxy Route
  app.post("/api/ai/generate", async (req, res) => {
    const { model, contents, config, systemInstruction } = req.body;
    console.log(`[AI PROXY] Request for model: ${model || 'default'}`);
    
    try {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY;
      
      if (!key) {
        console.error("[AI PROXY] ERROR: No API key found in Secrets!");
        return res.status(500).json({ 
          error: "Ключ API не найден на сервере. Пожалуйста, добавьте GEMINI_API_KEY или API_KEY в меню Settings -> Secrets." 
        });
      }

      const genAI = new GoogleGenerativeAI(key);
      const genModel = genAI.getGenerativeModel({ 
        model: model || "gemini-3-flash-preview",
        systemInstruction: systemInstruction
      });

      const result = await genModel.generateContent({
        contents: contents,
        generationConfig: config
      });

      const response = await result.response;
      const text = response.text();

      return res.json({ text });
    } catch (error: any) {
      console.error("[AI PROXY] ERROR:", error.message || error);
      // Ensure we return JSON even on failure
      return res.status(500).json({ 
        error: error.message || "Ошибка при обращении к ИИ. Проверьте правильность ключа API." 
      });
    }
  });

  // 2. Health check / Diagnostic
  app.get("/api/health", (req, res) => {
    const hasKey = !!(process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY);
    res.json({ 
      status: "online", 
      hasKey, 
      keyPrefix: hasKey ? (process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY)?.substring(0, 4) : null,
      time: new Date().toISOString() 
    });
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
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
