import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // DYNAMIC ENV GENERATION & KEY DISCOVERY
  const getApiKeyFromEnv = () => {
    const envKeys = Object.keys(process.env);
    console.log("[SERVER] Scanning environment for keys...");
    
    // Priority list of environment variables
    const priority = ['GEMINI_API_KEY', 'API_KEY', 'GOOGLE_API_KEY', 'AI_KEY', 'VITE_GEMINI_API_KEY'];
    
    for (const keyName of priority) {
      const val = process.env[keyName];
      if (val && val.length > 15) {
        console.log(`[SERVER] Found valid key in ${keyName} (Length: ${val.length})`);
        return val;
      }
    }

    // Secondary scan for anything containing 'KEY' and 'AI'
    const fallbackKeyName = envKeys.find(k => (k.includes('KEY') || k.includes('GEMINI')) && process.env[k]?.length! > 15);
    if (fallbackKeyName) {
      const val = process.env[fallbackKeyName];
      console.log(`[SERVER] Found potential key in ${fallbackKeyName} (Length: ${val?.length})`);
      return val;
    }
    
    return "";
  };

  let apiKey = getApiKeyFromEnv();
  
  // AGGRESSIVE FILE SEARCH
  if (!apiKey) {
    console.log("[SERVER] Key not found in process.env, searching files...");
    const filesToSearch = ['.env', '.env.example', 'firebase-applet-config.json', 'firebase-blueprint.json'];
    for (const file of filesToSearch) {
      try {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const match = content.match(/AIza[a-zA-Z0-9_-]{30,}/) || content.match(/[a-zA-Z0-9_-]{35,}/);
          if (match) {
            apiKey = match[0];
            console.log(`[SERVER] Found key in ${file}: ${apiKey.substring(0, 4)}...`);
            break;
          }
        }
      } catch (e) {
        console.error(`[SERVER] Error reading ${file}:`, e);
      }
    }
  }

  // FINAL FALLBACK
  if (!apiKey) {
    console.log("[SERVER] No API key found in environment.");
  }

  // Write to public folder so Vite serves it as a real file
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    const configContent = `
      (function() {
        var key = "${apiKey}";
        window.__GEMINI_API_KEY__ = key;
        window.GEMINI_API_KEY = key; // Fallback
        console.log("[PUBLIC-CONFIG] Key loaded from public/gemini-config.js");
      })();
    `;
    fs.writeFileSync(path.join(publicDir, 'gemini-config.js'), configContent);
    console.log("[SERVER] Successfully wrote key to public/gemini-config.js");
  } catch (e) {
    console.error("[SERVER] Failed to write to public folder:", e);
  }

  app.use(cors());
  app.use(express.json());

  // --- SECURE AI PROXY ROUTES ---
  app.post("/api/ai/chat", async (req, res) => {
    const key = getApiKeyFromEnv() || apiKey;
    if (!key) return res.status(500).json({ error: "AI Key not configured on server" });

    const { type, prompt, profile, history } = req.body;
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: type === 'genius' 
          ? `You are the GENIUS LAB CORE. world-class researcher. Student: ${profile.studentClass}. Interests: ${profile.interests.join(', ')}. Metaphors based on interests. Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
          : `ThinkFlow Sidekick. Interests: ${profile.interests.join(', ')}. Respond in ${profile.language === 'ru' ? 'Russian' : 'English'}.`
      });

      const result = await model.generateContent({
        contents: [
          ...history.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        tools: [{ googleSearch: {} }] as any,
      });

      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/tree", async (req, res) => {
    const key = getApiKeyFromEnv() || apiKey;
    if (!key) return res.status(500).json({ error: "AI Key not configured on server" });

    const { topic, profile } = req.body;
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `GENERATE A KNOWLEDGE TREE FOR: "${topic}". 5-7 core concepts explained via Metaphors of: ${profile.interests.join(', ')}. Return ONLY JSON.`;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }] as any,
      });

      res.json(JSON.parse(result.response.text()));
    } catch (error: any) {
      console.error("AI Proxy Tree Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 1. Synchronous Key Delivery (The most robust way)
  app.get("/gemini-config.js", (req, res) => {
    const currentKey = getApiKeyFromEnv() || apiKey;
    console.log(`[SERVER] Serving /gemini-config.js (Key present: ${!!currentKey})`);
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(`
      (function() {
        var key = ${JSON.stringify(currentKey)};
        window.__GEMINI_API_KEY__ = key;
        window.GEMINI_API_KEY = key; // Fallback
        console.log("[GEMINI-CONFIG] Key injected into window.__GEMINI_API_KEY__");
        if (!key) console.error("[GEMINI-CONFIG] CRITICAL: Key is empty!");
      })();
    `);
  });

  // 2. API ROUTES
  app.get("/api/config", (req, res) => {
    const keys = [process.env.GEMINI_API_KEY, process.env.API_KEY, process.env.AI_KEY, process.env.VITE_GEMINI_API_KEY];
    const currentKey = keys.find(k => k && k.length > 5) || apiKey || "";
    
    res.json({ 
      apiKey: currentKey,
      hasKey: !!currentKey
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "online", time: new Date().toISOString() });
  });

  app.get("/api/debug", (req, res) => {
    res.json({
      envKeys: Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('GEMINI') || k.includes('AI')),
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!(process.env.API_KEY || process.env.GEMINI_API_KEY),
      apiKeyLength: (process.env.API_KEY || process.env.GEMINI_API_KEY || "").length
    });
  });

  // Vite / Static Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(async (req, res, next) => {
      if (req.url === '/' || req.url === '/index.html') {
        try {
          const currentKey = getApiKeyFromEnv() || apiKey;
          let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          html = await vite.transformIndexHtml(req.url, html);
          
          // Inject the key directly into the HTML
          const injection = `
            <meta name="gemini-api-key" content="${currentKey}">
            <script>window.__GEMINI_API_KEY__ = "${currentKey}";</script>
          `;
          html = html.replace('</head>', `${injection}</head>`);
          
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
          return;
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const currentKey = getApiKeyFromEnv() || apiKey;
      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      const injection = `
        <meta name="gemini-api-key" content="${currentKey}">
        <script>window.__GEMINI_API_KEY__ = "${currentKey}";</script>
      `;
      html = html.replace('</head>', `${injection}</head>`);
      res.send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error("[FATAL]", err));
