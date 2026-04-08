import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Check all possible names for the API key from both process.env and .env files
    const apiKey = process.env.GEMINI_API_KEY || 
                   env.GEMINI_API_KEY || 
                   process.env.API_KEY || 
                   env.API_KEY || 
                   process.env.AI_KEY || 
                   env.AI_KEY || 
                   '';

    console.log('Vite Build: API Key status:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 3) + '...)' : 'NOT FOUND');

    return {
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
