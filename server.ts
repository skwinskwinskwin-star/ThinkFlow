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

  // DYNAMIC ENV GENERATION
  // This ensures Vite always sees the API keys from the platform secrets
  // We look for keys starting with 'AIza' to avoid placeholders like 'MY_GEMINI_API_KEY'
  const keys = [process.env.GEMINI_API_KEY, process.env.API_KEY, process.env.AI_KEY];
  const apiKey = keys.find(k => k && k.startsWith('AIza')) || "";
  
  if (apiKey) {
    const envContent = `VITE_GEMINI_API_KEY=${apiKey}\nGEMINI_API_KEY=${apiKey}\nAPI_KEY=${apiKey}\n`;
    try {
      fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
      console.log(`[SERVER] Dynamic .env generated with real key (length: ${apiKey.length})`);
    } catch (e) {
      console.error("[SERVER] Failed to write .env file", e);
    }
  } else {
    console.warn("[SERVER] No real API key (starting with AIza) found in environment!");
  }

  console.log(`[SERVER] Starting ThinkFlow AI Server...`);
  console.log(`[SERVER] Environment Check: API_KEY=${!!process.env.API_KEY}, GEMINI_API_KEY=${!!process.env.GEMINI_API_KEY}`);
  
  app.use(cors());
  app.use(express.json());

  // API ROUTES
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
