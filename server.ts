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

  console.log(`[SERVER] Initializing ThinkFlow Backend...`);
  
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTER ---
  const apiRouter = express.Router();

  // Middleware to ensure JSON response for all API calls
  apiRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    console.log(`[API REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Health check with detailed info
  apiRouter.get("/health", (req, res) => {
    const apiKey = process.env.API_KEY || process.env.AI_KEY || process.env.GEMINI_API_KEY;
    res.json({ 
      status: "online", 
      version: "2.0.0-router-fix",
      hasKey: !!apiKey,
      keyPrefix: apiKey ? apiKey.substring(0, 4) : null,
      env: process.env.NODE_ENV || 'development'
    });
  });

  // AI Generation Route
  apiRouter.post("/ai/generate", async (req, res) => {
    const { model, contents, config, systemInstruction } = req.body;
    const apiKey = process.env.API_KEY || process.env.AI_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY is missing on server. Check platform settings." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const generativeModel = genAI.getGenerativeModel({ 
        model: model || "gemini-1.5-flash",
        systemInstruction
      });

      const result = await generativeModel.generateContent({
        contents,
        generationConfig: config
      });

      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("[AI ERROR]", error);
      res.status(500).json({ error: error.message || "AI Generation failed" });
    }
  });

  // Mount API Router
  app.use("/api", apiRouter);

  // --- VITE / STATIC ASSETS ---
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
    console.log(`[SERVER] ThinkFlow is live on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[FATAL ERROR]", err);
});
