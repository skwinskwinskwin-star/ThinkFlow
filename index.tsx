
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[DEBUG] process.env.GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('[DEBUG] process.env.API_KEY length:', process.env.API_KEY?.length || 0);

import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ErrorBoundary } from './src/components/UI/ErrorBoundary';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
