import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  
  console.log('--- VITE CONFIG DEBUG ---');
  console.log('GEMINI_API_KEY found:', !!(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY));
  console.log('API_KEY found:', !!(env.API_KEY || process.env.API_KEY));
  console.log('Final apiKey length:', apiKey.length);
  console.log('-------------------------');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env': JSON.stringify({
        GEMINI_API_KEY: apiKey,
        API_KEY: apiKey,
        NODE_ENV: process.env.NODE_ENV || 'development'
      })
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
