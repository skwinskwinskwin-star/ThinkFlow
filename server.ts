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

  app.use(express.json({ limit: '10mb' }));

  // API Route for Gemini
  app.post("/api/ai/generate", async (req, res) => {
    const { model, contents, config, systemInstruction } = req.body;
    
    const apiKey = process.env.API_KEY || process.env.AI_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "API Key is missing on the server. Please check platform settings." 
      });
    }

    try {
      const genAI = new GoogleGenAI(apiKey);
      const aiModel = genAI.getGenerativeModel({ 
        model,
        systemInstruction
      });

      const result = await aiModel.generateContent({
        contents,
        generationConfig: config
      });

      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("Server-side Gemini Error:", error);
      res.status(500).json({ 
        error: error.message || "An error occurred during AI generation." 
      });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
