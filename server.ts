import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // DYNAMIC ENV GENERATION & KEY DISCOVERY
  const keys = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    API_KEY: process.env.API_KEY,
    AI_KEY: process.env.AI_KEY,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY
  };
  
  const apiKey = Object.values(keys).find(k => k && k.startsWith('AIza')) || "";
  
  if (apiKey) {
    console.log(`[SERVER] API key detected (starts with ${apiKey.substring(0, 4)}...)`);
    // Write to .env for Vite as a backup
    try {
      fs.writeFileSync(path.join(process.cwd(), '.env'), `VITE_GEMINI_API_KEY=${apiKey}\nGEMINI_API_KEY=${apiKey}\nAPI_KEY=${apiKey}\n`);
    } catch (e) {}
  } else {
    console.error("[SERVER] CRITICAL: No API key found!");
  }

  app.use(cors());
  app.use(express.json());

  // CONFIG ENDPOINT
  app.get("/api/config", (req, res) => {
    res.json({ 
      apiKey: apiKey,
      hasKey: !!apiKey,
      status: apiKey ? "ready" : "missing_key"
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "online", time: new Date().toISOString() });
  });

  // Vite / Static Middleware
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
