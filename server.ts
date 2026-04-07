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

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  console.log(`API_KEY present: ${!!process.env.API_KEY}`);
  console.log(`AI_KEY present: ${!!process.env.AI_KEY}`);
  console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);

  // Request Logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      time: new Date().toISOString(),
      hasApiKey: !!(process.env.API_KEY || process.env.AI_KEY || process.env.GEMINI_API_KEY)
    });
  });

  // API Route for Gemini
  app.post("/api/ai/generate", async (req, res) => {
    console.log("Processing AI request...");
    const { model, contents, config, systemInstruction } = req.body;
    
    const apiKey = process.env.API_KEY || process.env.AI_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("CRITICAL: API Key missing in server environment");
      return res.status(500).json({ 
        error: "API Key is missing on the server. Please check platform settings." 
      });
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model,
        contents,
        config: { ...config, systemInstruction }
      });

      console.log("AI generation successful");
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Server-side Gemini Error:", error);
      res.status(500).json({ 
        error: error.message || "An error occurred during AI generation." 
      });
    }
  });

  // Catch-all for API routes that don't exist
  app.all("/api/*", (req, res) => {
    console.warn(`404 - API route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API route not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Using Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
