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

  console.log(`[SERVER] Starting ThinkFlow Static Server...`);
  
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", time: new Date().toISOString() });
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
