import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import { GoogleGenAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AI on the server
const getAIKey = () => {
  const keys = [process.env.GEMINI_API_KEY, process.env.API_KEY, process.env.AI_KEY, process.env.VITE_GEMINI_API_KEY];
  return keys.find(k => k && k.startsWith('AIza')) || "";
};

const genAI = new GoogleGenAI(getAIKey());

async function startServer() {
  const app = express();
  const PORT = 3000;

  // DYNAMIC ENV GENERATION
  const keys = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    API_KEY: process.env.API_KEY,
    AI_KEY: process.env.AI_KEY,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY
  };
  
  console.log("[SERVER] Environment Keys Check:", Object.keys(keys).map(k => `${k}: ${keys[k] ? 'EXISTS' : 'MISSING'}`));
  
  const apiKey = Object.values(keys).find(k => k && k.startsWith('AIza')) || "";
  
  if (apiKey) {
    console.log(`[SERVER] Real API key found (starts with ${apiKey.substring(0, 4)}...)`);
    const envContent = `VITE_GEMINI_API_KEY=${apiKey}\nGEMINI_API_KEY=${apiKey}\nAPI_KEY=${apiKey}\n`;
    try {
      fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
    } catch (e) {
      console.error("[SERVER] Failed to write .env file", e);
    }
  } else {
    console.error("[SERVER] CRITICAL: No real API key found in environment variables!");
  }

  console.log(`[SERVER] Starting ThinkFlow AI Server...`);
  
  app.use(cors());
  app.use(express.json());

  // AI PROXY ROUTE
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, systemInstruction } = req.body;
      const key = getAIKey();
      
      if (!key) {
        return res.status(500).json({ error: "API Key missing on server" });
      }

      const aiModel = genAI.getGenerativeModel({ 
        model: model || "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      const result = await aiModel.generateContent({ contents });
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("Server AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API ROUTES
  app.get("/api/config", (req, res) => {
    // We look for keys starting with 'AIza' to avoid placeholders
    const keys = [process.env.GEMINI_API_KEY, process.env.API_KEY, process.env.AI_KEY];
    const apiKey = keys.find(k => k && k.startsWith('AIza')) || "";
    
    res.json({ 
      apiKey: apiKey,
      hasKey: !!apiKey
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      time: new Date().toISOString()
    });
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
      define: {
        "process.env.GEMINI_API_KEY": JSON.stringify(apiKey),
        "process.env.API_KEY": JSON.stringify(apiKey),
      }
    });
    
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
