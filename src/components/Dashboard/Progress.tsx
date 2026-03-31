
import React from 'react';
import { BarChart3, Trophy, Zap, Target, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';

export const Progress: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();

  if (!profile) return null;

  const xpToNextLevel = profile.level * 1000;
  const progressPercent = (profile.xp % 1000) / 10;

  const stats = [
    { label: "Total XP", value: profile.xp.toLocaleString(), icon: Zap, color: "text-indigo-500" },
    { label: "Current Level", value: profile.level, icon: Trophy, color: "text-yellow-500" },
    { label: "Tasks Done", value: "12", icon: Target, color: "text-emerald-500" },
    { label: "Global Rank", value: "#4", icon: Star, color: "text-purple-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.progress}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Your intellectual growth journey tracked in real-time.
          </p>
        </div>
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <BarChart3 className="w-10 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-8 rounded-[2.5rem] border border-[var(--border)] flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl bg-[var(--input)] flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-[var(--text)]">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-12 md:p-16 rounded-[4rem] border border-[var(--border)] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-black uppercase tracking-tighter text-[var(--text)]">Level {profile.level}</h3>
              <p className="text-[var(--muted)] font-medium">Next Level: {profile.level + 1}</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black text-indigo-500 font-mono tracking-tighter">{profile.xp % 1000} / 1000</p>
              <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest mt-1">XP to next level</p>
            </div>
          </div>

          <div className="h-6 bg-[var(--input)] rounded-full overflow-hidden border border-[var(--border)] p-1">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/40"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[var(--text)]">Growth Rate</p>
                <p className="text-[var(--muted)] text-[10px] font-bold">+15% this week</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[var(--text)]">Daily Streak</p>
                <p className="text-[var(--muted)] text-[10px] font-bold">5 Days</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[var(--text)]">Focus Score</p>
                <p className="text-[var(--muted)] text-[10px] font-bold">88/100</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
