import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // We prioritize process.env (injected by platform) then .env files
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.AI_KEY || env.AI_KEY || '';

    return {
      plugins: [react(), tailwindcss()],
      define: {
        // This makes process.env.GEMINI_API_KEY available in the browser
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
