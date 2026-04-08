import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] ThinkFlow Engine v7.0 starting...`);
  
  app.use(express.json());

  // Request Logger for debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // --- API ROUTES ---
  const api = express.Router();

  // Health check
  api.get("/health", (req, res) => {
    const key = process.env.GEMINI_API_KEY || process.env.AI_KEY || process.env.API_KEY;
    res.json({ 
      status: "online", 
      version: "7.0.0-stable",
      hasKey: !!key,
      keyPrefix: key ? key.substring(0, 4) : null,
      env: process.env.NODE_ENV || 'development'
    });
  });

  // AI Generation Proxy
  api.post("/ai/generate", async (req, res) => {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_KEY || process.env.API_KEY;

    if (!apiKey) {
      console.error("[SERVER] API Key missing!");
      return res.status(500).json({ 
        error: "API_KEY_MISSING", 
        message: "API Key not found on server. Please add GEMINI_API_KEY to Secrets." 
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ 
        model: model || "gemini-1.5-flash",
        systemInstruction: config?.systemInstruction
      });

      // Remove systemInstruction from generationConfig to avoid duplication
      const { systemInstruction, ...generationConfig } = config || {};

      const result = await genModel.generateContent({
        contents,
        generationConfig
      });

      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("[SERVER AI ERROR]", error);
      res.status(500).json({ 
        error: "AI_FAILED", 
        message: error.message || "Gemative AI call failed" 
      });
    }
  });

  app.use("/api", api);

  // Catch-all for /api that didn't match any route
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found", path: req.originalUrl });
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
    console.log(`[SERVER] ThinkFlow is live on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
