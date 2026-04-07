import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Debug: Log found keys (masked)
    console.log('Vite Config: Checking for API keys...');
    ['GEMINI_API_KEY', 'AI_KEY', 'API_KEY', 'VITE_AI_KEY'].forEach(key => {
      const val = process.env[key] || env[key];
      if (val) {
        console.log(`- Found ${key}: ${val.substring(0, 6)}...`);
      }
    });

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
        'process.env.VITE_AI_KEY': JSON.stringify(process.env.AI_KEY || env.AI_KEY || ''),
        'process.env.VITE_API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY || ''),
        // Fallback for import.meta.env
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
        'import.meta.env.VITE_AI_KEY': JSON.stringify(process.env.AI_KEY || env.AI_KEY || ''),
        'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
