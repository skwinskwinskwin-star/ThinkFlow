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
    
    // Inject API Key into HTML in dev mode
    app.use(async (req, res, next) => {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY || '';
      const originalWrite = res.write;
      const originalEnd = res.end;

      // We only want to intercept HTML responses
      if (req.url.endsWith('/') || req.url.endsWith('.html') || !req.url.includes('.')) {
        // This is a bit complex with Vite middleware, so we'll use a simpler approach:
        // Just set a cookie or a header that the frontend can read.
        res.setHeader('Set-Cookie', `__GEMINI_KEY=${key}; Path=/; SameSite=Strict`);
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.AI_KEY || '';
      // In production, we can read the file and inject the script
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <script>window.GEMINI_API_KEY = "${key}";</script>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
      `);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Static server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
