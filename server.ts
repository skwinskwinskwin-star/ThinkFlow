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

  app.use(cors());
  app.use(express.json());

  // API ROUTES FIRST - Before anything else
  app.get("/api/health", (req, res) => {
    const keys = Object.keys(process.env);
    const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY;
    
    console.log(`[HEALTH] Request received. Key found: ${!!geminiKey}`);
    
    res.json({ 
      status: "online", 
      hasKey: !!geminiKey,
      detectedKeys: keys.filter(k => k.includes("KEY") || k.includes("AI")),
      time: new Date().toISOString() 
    });
  });

  app.all("/api/ai/generate", async (req, res) => {
    const { model, contents, config, systemInstruction } = req.method === 'POST' ? req.body : req.query;
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY;
    
    if (!key) {
      return res.status(500).json({ error: "API Key missing on server" });
    }

    try {
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
      return res.json({ text: response.text() });
    } catch (error: any) {
      console.error("[AI PROXY] Error:", error);
      return res.status(500).json({ error: error.message || "AI Generation failed" });
    }
  });

  // Logging middleware for other requests
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
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
