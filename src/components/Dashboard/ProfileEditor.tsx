
import React, { useState } from 'react';
import { User, Camera, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { INTERESTS, CLASSES } from '../../constants';
import { StudentClass, UserProfile } from '../../types';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

export const ProfileEditor: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [photoURL, setPhotoURL] = useState<string | undefined>(profile?.photoURL);

  const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB for processing)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setPhotoURL(compressed);
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile || isSaving) return;
    setIsSaving(true);

    const fd = new FormData(e.currentTarget);
    const ageVal = fd.get('age') as string;
    
    const updatedProfile: Partial<UserProfile> = {
      name: fd.get('name') as string,
      bio: fd.get('bio') as string,
      studentClass: (fd.get('class') as StudentClass) || profile.studentClass,
      interests: selectedInterests,
      age: ageVal ? parseInt(ageVal) : profile.age,
      photoURL: photoURL
    };

    try {
      await updateProfileData(updatedProfile);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to save profile. Please try a smaller image or check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.profile}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Customize your digital identity in the ThinkFlow ecosystem.
          </p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl overflow-hidden relative">
            {photoURL ? (
              <img src={photoURL} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name[0]
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="avatar-upload"
            onChange={handlePhotoUpload}
          />
          <label 
            htmlFor="avatar-upload"
            className="absolute -bottom-2 -right-2 bg-[var(--card)] p-3 rounded-xl shadow-xl border border-[var(--border)] group-hover:scale-110 transition-transform cursor-pointer"
          >
            <Camera className="w-4 h-4 text-indigo-500" />
          </label>
        </motion.div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-10 md:p-14 rounded-[4rem] border border-[var(--border)] shadow-2xl overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest group-focus-within:text-indigo-500 transition-colors">{t.name}</label>
                <motion.input 
                  whileFocus={{ scale: 1.01 }}
                  name="name" 
                  defaultValue={profile.name} 
                  required
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all`} 
                />
              </div>
              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest group-focus-within:text-indigo-500 transition-colors">Age</label>
                <motion.input 
                  whileFocus={{ scale: 1.01 }}
                  name="age" 
                  type="number"
                  defaultValue={profile.age} 
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all`} 
                />
              </div>
              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest group-focus-within:text-indigo-500 transition-colors">Class</label>
                <motion.select 
                  whileFocus={{ scale: 1.01 }}
                  name="class" 
                  defaultValue={profile.studentClass} 
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer`}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </motion.select>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest group-focus-within:text-indigo-500 transition-colors">{t.bio}</label>
                <motion.textarea 
                  whileFocus={{ scale: 1.01 }}
                  name="bio" 
                  defaultValue={profile.bio} 
                  className={`w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 transition-all h-[212px] resize-none`} 
                />
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-10 space-y-4">
            <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">My Interests</label>
            <div className={`p-8 bg-[var(--input)] rounded-[2.5rem] border border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4`}>
              {INTERESTS.map((i, idx) => {
                const isSelected = selectedInterests.includes(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(i)}
                    className={`
                      relative flex items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all duration-300
                      ${isSelected 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-black/20 border-white/5 text-[var(--muted)] hover:border-white/10'
                      }
                    `}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">{i}</span>
                    {isSelected && (
                      <motion.div 
                        layoutId="check"
                        className="absolute -top-1 -right-1 bg-white rounded-full p-0.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </Card>

        <motion.div variants={itemVariants} className="flex items-center gap-6">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 h-20 rounded-[2rem] gap-3 text-lg relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {t.update}
          </Button>
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-xs"
              >
                <CheckCircle2 className="w-6 h-6" />
                Saved!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div >
      </form>
    </motion.div>
  );
};
