import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("[SERVER] Booting ThinkFlow AI Proxy Server...");

// Initialize AI on the server where the key is safe
const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY;
  console.log(`[SERVER] API Key check: ${key ? 'PRESENT (starts with ' + key.substring(0, 4) + '...)' : 'MISSING'}`);
  if (!key) {
    console.warn("[SERVER] No API key found in environment variables!");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Starting ThinkFlow AI Server...`);
  console.log(`[SERVER] Mode: ${process.env.NODE_ENV || 'development'}`);
  
  // 1. Basic Middleware
  app.use(cors());
  app.use(express.json());

  // 2. AI Proxy Route - MOUNTED DIRECTLY AND FIRST
  app.post("/api/ai/generate", async (req, res) => {
    console.log(`[AI PROXY] Request received for model: ${req.body.model || 'default'}`);
    
    try {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY;
      
      if (!key) {
        console.error("[AI PROXY] ERROR: No API key found in Secrets!");
        return res.status(500).json({ error: "API Key not found. Please add API_KEY to Secrets." });
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

      console.log("[AI PROXY] SUCCESS: Content generated");
      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("[AI PROXY] ERROR:", error.message || error);
      return res.status(500).json({ error: error.message || "Internal AI Error" });
    }
  });

  // 3. Diagnostic Routes
  app.get("/api/ping", (req, res) => {
    const hasKey = !!(process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY);
    res.json({ status: "ok", hasKey, time: new Date().toISOString() });
  });

  // 4. Catch-all for other /api routes to prevent falling through to static
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // 5. Static / Vite Middleware
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
