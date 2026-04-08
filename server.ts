import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("[SERVER] Booting ThinkFlow AI Proxy Server...");

// Initialize AI on the server where the key is safe
const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY;
  if (!key) {
    console.warn("[SERVER] No API key found in environment variables!");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] ThinkFlow Static Server starting...`);
  
  app.use(express.json());

  // Diagnostic endpoint
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", time: new Date().toISOString() });
  });

  // Proxy route for AI generation - KEY NEVER LEAVES THE SERVER
  app.post("/api/ai/generate", async (req, res) => {
    console.log(`[SERVER] AI Request received for model: ${req.body.model}`);
    try {
      const { model, contents, config, systemInstruction } = req.body;
      const ai = getAiClient();
      
      if (!ai) {
        console.error("[SERVER] AI Client initialization failed (no key)");
        return res.status(500).json({ error: "API Key not configured on server. Please add API_KEY to Secrets." });
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents,
        config: {
          ...config,
          systemInstruction
        }
      });

      console.log("[SERVER] AI Response generated successfully");
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[SERVER] AI Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      version: "8.0.0-frontend-only",
      env: process.env.NODE_ENV || 'development'
    });
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
    console.log(`[SERVER] Static server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
