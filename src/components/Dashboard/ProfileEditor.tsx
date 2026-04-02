
import React, { useState } from 'react';
import { User, Camera, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { INTERESTS, CLASSES } from '../../constants';
import { StudentClass, UserProfile } from '../../types';
import { supabase, handleSupabaseError } from '../../services/supabase';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

export const ProfileEditor: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile || isSaving) return;
    setIsSaving(true);

    const fd = new FormData(e.currentTarget);
    const interests = INTERESTS.filter(i => fd.get(`interest-${i}`));

    const updatedProfile: Partial<UserProfile> = {
      name: fd.get('name') as string,
      bio: fd.get('bio') as string,
      studentClass: fd.get('class') as StudentClass,
      interests,
      age: parseInt(fd.get('age') as string) || profile.age
    };

    try {
      const { error } = await supabase
        .from('users')
        .update(updatedProfile)
        .eq('uid', user.id);
      
      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `users/${user.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.profile}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Customize your digital identity in the ThinkFlow ecosystem.
          </p>
        </div>
        <div className="relative group">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl overflow-hidden">
            {profile.photoURL ? <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" /> : profile.name[0]}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-[var(--card)] p-3 rounded-xl shadow-xl border border-[var(--border)] group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4 text-indigo-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-10 md:p-14 rounded-[4rem] border border-[var(--border)] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">{t.name}</label>
                <input 
                  name="name" 
                  defaultValue={profile.name} 
                  required
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Age</label>
                <input 
                  name="age" 
                  type="number"
                  defaultValue={profile.age} 
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Class</label>
                <select 
                  name="class" 
                  defaultValue={profile.studentClass} 
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all`}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">{t.bio}</label>
                <textarea 
                  name="bio" 
                  defaultValue={profile.bio} 
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all h-[212px] resize-none`} 
                />
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">My Interests</label>
            <div className={`p-8 bg-[var(--input)] rounded-[2.5rem] border border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4`}>
              {INTERESTS.map(i => (
                <label key={i} className="flex items-center gap-3 text-[10px] font-black uppercase text-[var(--muted)] hover:text-indigo-500 cursor-pointer transition-colors group">
                  <input 
                    type="checkbox" 
                    name={`interest-${i}`} 
                    defaultChecked={profile.interests.includes(i)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500"
                  /> 
                  <span className="group-hover:translate-x-1 transition-transform">{i}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-6">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 h-20 rounded-[2rem] gap-3 text-lg"
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {t.update}
          </Button>
          {showSuccess && (
            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-xs animate-in slide-in-from-left-4">
              <CheckCircle2 className="w-6 h-6" />
              Saved!
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
