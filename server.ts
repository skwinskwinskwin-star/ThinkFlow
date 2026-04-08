import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AI on the server where the key is safe
const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] ThinkFlow Static Server starting...`);
  
  app.use(express.json());

  // Proxy route for AI generation - KEY NEVER LEAVES THE SERVER
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, config, systemInstruction } = req.body;
      const ai = getAiClient();
      
      if (!ai) {
        return res.status(500).json({ error: "API Key not configured on server. Please add GEMINI_API_KEY to Secrets." });
      }

      const genModel = ai.getGenerativeModel({ 
        model: model || "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      const result = await genModel.generateContent({
        contents,
        generationConfig: config
      });

      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("Server AI Error:", error);
      res.status(500).json({ error: error.message });
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
