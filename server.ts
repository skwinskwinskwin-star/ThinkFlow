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

  console.log(`[SERVER] ThinkFlow Engine v4.0 starting...`);
  
  app.use(express.json({ limit: '10mb' }));

  // --- ROBUST API ROUTER ---
  const api = express.Router();

  api.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  api.get("/health", (req, res) => {
    const key = process.env.GEMINI_API_KEY || process.env.AI_KEY || process.env.API_KEY;
    res.json({ 
      status: "online", 
      version: "4.0.0-final",
      hasKey: !!key,
      keyPrefix: key ? key.substring(0, 4) : null
    });
  });

  api.post("/ai/generate", async (req, res) => {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_KEY || process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY_MISSING", message: "API Key not found in server environment." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents,
        config
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[AI_SERVER_ERROR]", error);
      res.status(500).json({ 
        error: "AI_FAILED", 
        message: error.message || "Gemini API call failed" 
      });
    }
  });

  app.use("/api", api);

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
