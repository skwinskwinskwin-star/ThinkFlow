import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Robust key discovery including .env.example
  let apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || "";
  
  if (!apiKey) {
    try {
      const examplePath = path.resolve(process.cwd(), '.env.example');
      if (fs.existsSync(examplePath)) {
        const content = fs.readFileSync(examplePath, 'utf-8');
        const match = content.match(/GEMINI_API_KEY=(AIza[a-zA-Z0-9_-]+)/);
        if (match) {
          apiKey = match[1];
          console.log("[VITE-CONFIG] Found key in .env.example");
        }
      }
    } catch (e) {}
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
