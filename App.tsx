
import React, { useState, useEffect } from 'react';
import { useAuth } from './src/context/AuthContext';
import { useTheme } from './src/context/ThemeContext';
import { useLanguage } from './src/context/LanguageContext';
import { Sidebar } from './src/components/Layout/Sidebar';
import { Navbar } from './src/components/Layout/Navbar';
import { Chat } from './src/components/Dashboard/Chat';
import { Tasks } from './src/components/Dashboard/Tasks';
import { Leaderboard } from './src/components/Dashboard/Leaderboard';
import { Articles } from './src/components/Dashboard/Articles';
import { Tips } from './src/components/Dashboard/Tips';
import { Quotes } from './src/components/Dashboard/Quotes';
import { Reviews } from './src/components/Dashboard/Reviews';
import { ProfileEditor } from './src/components/Dashboard/ProfileEditor';
import { Progress } from './src/components/Dashboard/Progress';
import { Settings } from './src/components/Dashboard/Settings';
import { Admin } from './src/components/Dashboard/Admin';
import { GeniusLab } from './src/components/Dashboard/GeniusLab';
import { Landing } from './src/components/Landing/Landing';
import { AuthModal } from './src/components/Auth/AuthModal';
import { GeniusBackground } from './src/components/UI/GeniusBackground';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState('genius_lab');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close modal when user logs in
  useEffect(() => {
    if (user) {
      setIsAuthModalOpen(false);
    }
  }, [user]);

  // If auth is not ready or loading, show a loader
  if (!isAuthReady || loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl animate-pulse shadow-2xl shadow-indigo-500/20">
            T
          </div>
          <div className="flex items-center gap-3 text-[var(--muted)] font-black uppercase tracking-widest text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Initializing ThinkFlow
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show landing page
  if (!user) {
    return (
      <>
        <Landing onGetStarted={() => setIsAuthModalOpen(true)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  // If logged in but no profile (shouldn't happen with our signUp), show a loader or setup
  if (!profile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-[var(--muted)] font-black uppercase tracking-widest text-xs">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'genius_lab': return <GeniusLab />;
      case 'tasks': return <Tasks />;
      case 'leaderboard': return <Leaderboard />;
      case 'articles': return <Articles />;
      case 'tips': return <Tips />;
      case 'quotes': return <Quotes />;
      case 'reviews': return <Reviews />;
      case 'profile': return <ProfileEditor />;
      case 'progress': return <Progress />;
      case 'settings': return <Settings />;
      case 'admin': return <Admin />;
      default: return <GeniusLab />;
    }
  };

  return (
    <div className="h-screen flex text-[var(--text)] transition-colors duration-500 overflow-hidden relative">
      <GeniusBackground />
      
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 scroll-container custom-scrollbar p-6 md:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto min-h-full">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
