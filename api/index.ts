import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

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
    
    const ai = new GoogleGenAI({ apiKey: key });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || "") }]
        })).filter(m => m.parts[0].text),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: type === 'genius' 
          ? `GENIUS LAB. Student: ${profile?.studentClass}. Interests: ${profile?.interests?.join(', ')}. Respond in ${profile?.language === 'ru' ? 'Russian' : 'English'}.`
          : `ThinkFlow Sidekick. Respond in ${profile?.language === 'ru' ? 'Russian' : 'English'}.`
      }
    });

    res.json({ text: response.text });
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
    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `GENERATE A SCIENTIFIC KNOWLEDGE TREE FOR: "${topic}". 
    Use metaphors related to: ${profile?.interests?.join(', ')}.
    
    Return ONLY a JSON object with this EXACT structure:
    {
      "topic": "${topic}",
      "nodes": [
        {
          "id": "node_1",
          "label": "The Core Concept",
          "description": "Deep scientific explanation",
          "metaphor": "The metaphor based on interests",
          "challenge": "A small task for the student to verify understanding",
          "type": "core"
        },
        ... (at least 5 nodes)
      ],
      "connections": [
        { "from": "node_1", "to": "node_2" }
      ]
    }
    
    Ensure all node IDs are unique strings (node_1, node_2, etc.).
    Types allowed: 'core', 'branch', 'leaf'.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "{}";
    
    // Clean potential markdown wrap
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(text);
    
    // Safety check to ensure nodes exist
    if (!parsedData.nodes) {
      throw new Error("AI failed to generate structural nodes.");
    }

    res.json(parsedData);
  } catch (err: any) {
    console.error("Tree Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
