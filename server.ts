import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Starting ThinkFlow AI Proxy Server...`);
  console.log(`[SERVER] Environment Check: API_KEY=${!!process.env.API_KEY}, GEMINI_API_KEY=${!!process.env.GEMINI_API_KEY}`);
  
  app.use(cors());
  app.use(express.json());

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY || "");

  // API ROUTES
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      time: new Date().toISOString(),
      hasKey: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
    });
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, isJson } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: isJson ? { responseMimeType: "application/json" } : undefined
      });

      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("[AI PROXY ERROR]", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      const chat = model.startChat({
        history: messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const lastMsg = messages[messages.length - 1].text;
      const result = await chat.sendMessage(lastMsg);
      
      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("[AI CHAT ERROR]", error);
      res.status(500).json({ error: error.message });
    }
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
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
