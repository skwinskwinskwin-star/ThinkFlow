
import React from 'react';
import { 
  LayoutGrid, 
  Brain, 
  MessageSquare, 
  Zap, 
  Trophy, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  History,
  FileText,
  Lightbulb,
  Quote,
  MessageCircle,
  BarChart3,
  X,
  ShieldAlert,
  Sparkles,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentView, onViewChange }) => {
  const { profile, signOut, geniusMode, setGeniusMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const menuItems = [
    { id: 'genius_lab', label: t.geniusLab, icon: Brain },
    { id: 'community', label: t.community, icon: Users },
    { id: 'messages', label: t.messages, icon: MessageSquare },
    { id: 'tasks', label: t.tasks, icon: LayoutGrid },
    { id: 'progress', label: t.progress, icon: BarChart3 },
    { id: 'articles', label: t.articles, icon: FileText },
    { id: 'tips', label: t.tips, icon: Lightbulb },
    { id: 'reviews', label: t.reviews, icon: MessageCircle },
    { id: 'leaderboard', label: t.leaderboard, icon: Trophy },
    { id: 'profile', label: t.profile, icon: User },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  if (profile?.role === 'admin') {
    menuItems.push({ id: 'admin', label: t.admin, icon: ShieldAlert });
  }

  return (
    <>
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-[var(--card)] z-50 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
        transition-transform duration-300 border-r border-[var(--border)] 
        flex flex-col py-8 shadow-2xl overflow-hidden
      `}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('learn')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">TF</div>
            <span className="font-black text-2xl tracking-tighter uppercase italic text-[var(--text)]">ThinkFlow</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-[var(--muted)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`
                w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all group
                ${currentView === item.id 
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20' 
                  : 'text-[var(--muted)] hover:text-indigo-500 hover:bg-[var(--input)]'}
              `}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'group-hover:text-indigo-500'}`} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 mt-auto border-t border-[var(--border)] space-y-3">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-4 transition-all ${geniusMode ? 'text-indigo-400' : ''}`} 
            onClick={() => setGeniusMode(!geniusMode)}
          >
            <Sparkles className={`w-5 h-5 ${geniusMode ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.geniusMode}</span>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4" 
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{t.theme}</span>
          </Button>

          <div 
            className="p-4 bg-[var(--input)] rounded-2xl border border-[var(--border)] flex items-center gap-3 cursor-pointer hover:border-indigo-500/30 transition-all"
            onClick={() => onViewChange('profile')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
              {profile?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate text-[var(--text)]">{profile?.name}</p>
              <p className="text-[9px] font-black uppercase text-[var(--muted)]">{profile?.studentClass}</p>
            </div>
          </div>

          <button 
            onClick={() => signOut()} 
            className="w-full text-[var(--muted)] text-[10px] font-black uppercase text-left pl-4 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onToggle} 
        />
      )}
    </>
  );
};
