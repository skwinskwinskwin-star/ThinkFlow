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
  
  // Log all incoming requests for debugging
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
  });

  // Environment Keys Diagnostic
  console.log("[DEBUG] Environment Keys Check:");
  Object.keys(process.env).forEach(key => {
    if (key.includes("KEY") || key.includes("AI")) {
      console.log(`[DEBUG] Found key: ${key} (length: ${process.env[key]?.length})`);
    }
  });

  app.use(cors());
  app.use(express.json());

  // 1. AI Proxy Route
  app.all("/api/ai/generate", async (req, res) => {
    // Handle both POST and GET (though we expect POST)
    const { model, contents, config, systemInstruction } = req.method === 'POST' ? req.body : req.query;
    
    console.log(`[AI PROXY] ${req.method} request received`);
    
    try {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY;
      
      if (!key) {
        console.error("[AI PROXY] ERROR: No API key found in process.env!");
        console.log("[AI PROXY] Available keys:", Object.keys(process.env).filter(k => k.includes("KEY") || k.includes("AI")));
        return res.status(500).json({ 
          error: "Ключ API не найден на сервере. Пожалуйста, добавьте GEMINI_API_KEY или API_KEY в меню Settings → Secrets." 
        });
      }

      const genAI = new GoogleGenerativeAI(key);
      const genModel = genAI.getGenerativeModel({ 
        model: (model as string) || "gemini-3-flash-preview",
        systemInstruction: systemInstruction as string
      });

      const result = await genModel.generateContent({
        contents: contents as any,
        generationConfig: config as any
      });

      const response = await result.response;
      const text = response.text();

      return res.json({ text });
    } catch (error: any) {
      console.error("[AI PROXY] ERROR:", error.message || error);
      return res.status(500).json({ 
        error: error.message || "Ошибка при обращении к ИИ. Проверьте правильность ключа API." 
      });
    }
  });

  // 2. Health check / Diagnostic
  app.get("/api/health", (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const apiKey = process.env.API_KEY;
    const aiKey = process.env.AI_KEY;
    const viteGeminiKey = process.env.VITE_GEMINI_API_KEY;
    const viteApiKey = process.env.VITE_API_KEY;
    
    const hasKey = !!(geminiKey || apiKey || aiKey || viteGeminiKey || viteApiKey);
    
    console.log(`[HEALTH] Check: hasKey=${hasKey}, GEMINI_API_KEY=${!!geminiKey}, API_KEY=${!!apiKey}`);
    
    res.json({ 
      status: "online", 
      hasKey, 
      keys: {
        GEMINI_API_KEY: !!geminiKey,
        API_KEY: !!apiKey,
        AI_KEY: !!aiKey,
        VITE_GEMINI_API_KEY: !!viteGeminiKey,
        VITE_API_KEY: !!viteApiKey
      },
      time: new Date().toISOString() 
    });
  });

  // API 404 Handler
  app.use("/api/*", (req, res) => {
    console.warn(`[API 404] ${req.method} ${req.url}`);
    res.status(404).json({ error: `API Route not found: ${req.method} ${req.url}` });
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
