import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

app.use(cors());
app.use(express.json());

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.API_KEY || "";

// --- HEALTH CHECK ---
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    hasKey: !!getApiKey(),
    env: process.env.NODE_ENV 
  });
});

// --- CHAT PROXY ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    const key = getApiKey();
    if (!key) return res.status(500).json({ error: "API Key not configured" });

    const { type, prompt, profile, history = [] } = req.body;
    
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: type === 'genius' 
        ? `GENIUS LAB. Student: ${profile?.studentClass}. Interests: ${profile?.interests?.join(', ')}. Respond in ${profile?.language === 'ru' ? 'Russian' : 'English'}.`
        : `ThinkFlow Sidekick. Respond in ${profile?.language === 'ru' ? 'Russian' : 'English'}.`
    });

    const result = await model.generateContent({
      contents: [
        ...history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || "") }]
        })).filter(m => m.parts[0].text),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });

    res.json({ text: result.response.text() });
  } catch (err: any) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- TREE PROXY ---
app.post("/api/ai/tree", async (req, res) => {
  try {
    const key = getApiKey();
    if (!key) return res.status(500).json({ error: "API Key not configured" });

    const { topic, profile } = req.body;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `GENERATE KNOWLEDGE TREE FOR: "${topic}". Metaphors: ${profile?.interests?.join(', ')}. Return JSON: { "topic": string, "concepts": [{ "name": string, "metaphor": string, "explanation": string }] }`;
    
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean potential markdown wrap
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Tree Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
