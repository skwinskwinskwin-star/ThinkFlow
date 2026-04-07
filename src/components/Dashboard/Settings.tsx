
import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Shield, Bell, Trash2, LogOut, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useState } from 'react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { signOut, deleteAccount, geniusMode, setGeniusMode, profile, updateProfileData } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) {
      setIsDeleting(true);
      try {
        await deleteAccount();
      } catch (error) {
        alert('Failed to delete account. You may need to re-authenticate first.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSignOutEverywhere = async () => {
    // In standard Firebase, this is just a sign out
    // For a real "everywhere" sign out, we'd need a backend to revoke tokens
    await signOut();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.settings}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Configure your ThinkFlow experience.
          </p>
        </div>
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <SettingsIcon className="w-10 h-10" />
        </div>
      </div>

      <div className="space-y-8">
        <Card className="p-10 rounded-[3.5rem] border border-[var(--border)] space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">{t.theme}</h4>
                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Switch between light and dark mode</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`
                w-16 h-8 rounded-full transition-all relative p-1
                ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}
              `}
            >
              <div className={`
                w-6 h-6 bg-white rounded-full shadow-lg transition-transform
                ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}
              `} />
            </button>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">{t.language}</h4>
                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Select your preferred interface language</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['en', 'ru', 'uz'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l as any)}
                  className={`
                    px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${language === l 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">Notifications</h4>
                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Manage your learning alerts</p>
              </div>
            </div>
            <button className="w-16 h-8 bg-[var(--input)] rounded-full relative p-1 cursor-not-allowed opacity-50">
              <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
            </button>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-600/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">{t.geniusMode}</h4>
                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Enable advanced AI reasoning and metaphors</p>
              </div>
            </div>
            <button 
              onClick={() => setGeniusMode(!geniusMode)}
              className={`
                w-16 h-8 rounded-full transition-all relative p-1
                ${geniusMode ? 'bg-amber-500' : 'bg-slate-200'}
              `}
            >
              <div className={`
                w-6 h-6 bg-white rounded-full shadow-lg transition-transform
                ${geniusMode ? 'translate-x-8' : 'translate-x-0'}
              `} />
            </button>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">Learning Depth</h4>
                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">How deep should the AI go into concepts?</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['Surface', 'Deep', 'Architect'].map((d) => (
                <button
                  key={d}
                  onClick={() => updateProfileData({ learningDepth: d as any })}
                  className={`
                    px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${profile?.learningDepth === d 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'}
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">Explanation Style</h4>
                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Your preferred way of learning</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['Metaphorical', 'Technical', 'Simple'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateProfileData({ explanationStyle: s as any })}
                  className={`
                    px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${profile?.explanationStyle === s 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-10 rounded-[3.5rem] border border-rose-500/20 dark:border-rose-500/10 bg-rose-500/5 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black uppercase text-sm tracking-tighter text-rose-500">Danger Zone</h4>
              <p className="text-[10px] font-black uppercase text-rose-500/60 tracking-widest">Irreversible account actions</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex-1 h-16 rounded-2xl gap-3 transition-all"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
            <Button 
              variant="outline" 
              className="border-[var(--border)] flex-1 h-16 rounded-2xl gap-3 hover:bg-[var(--input)] transition-all text-[var(--text)]"
              onClick={handleSignOutEverywhere}
            >
              <LogOut className="w-5 h-5" />
              Sign Out Everywhere
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
