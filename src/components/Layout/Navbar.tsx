
import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { profile } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-8 md:px-12 bg-[var(--card)]/80 backdrop-blur-xl z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 text-[var(--muted)] hover:bg-[var(--input)] rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center gap-2 bg-[var(--input)] px-4 py-2 rounded-xl border border-[var(--border)]">
          <Search className="w-4 h-4 text-[var(--muted)]" />
          <input 
            type="text" 
            placeholder={t.searchThoughts} 
            className="bg-transparent border-none outline-none text-xs font-medium w-40 text-[var(--text)]"
          />
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-[var(--muted)] hover:bg-[var(--input)] rounded-xl transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--card)]" />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">{t.globalXP}</p>
              <p className="text-lg font-black text-indigo-500 leading-none">{profile?.xp || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile?.name?.[0] || 'U'
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
