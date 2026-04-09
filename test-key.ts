import { GoogleGenAI } from "@google/genai";

async function test() {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  console.log("Testing key:", key ? "FOUND (length " + key.length + ")" : "NOT FOUND");
  if (!key) return;

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hi",
    });
    console.log("Response success:", !!response.text);
  } catch (err) {
    console.error("Response error:", err);
  }
}

test();
