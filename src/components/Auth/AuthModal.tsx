
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleDemoMode = async () => {
    setLoading(true);
    setError('');
    try {
      // Demo login using a public test account
      await signIn('demo@thinkflow.ai', 'demo123456');
      onClose();
    } catch (err: any) {
      setError('Demo mode failed. Please register a new account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const name = fd.get('name') as string;

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Please check your internet connection or try a different browser/network. This can also happen if your browser blocks Firebase domains.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Account not found. If you were using the previous version, please register a new account (we have migrated to a new secure backend).');
      } else if (err.code === 'auth/wrong-password') {
        setError('Invalid password. Please try again.');
      } else {
        setError(err.message || 'Authentication failed. Please try again or use Demo Mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        style={{
          rotateY: mousePos.x * 10,
          rotateX: -mousePos.y * 10,
          perspective: 1000,
        }}
        className="w-full max-w-xl relative"
      >
        <Card className="w-full p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-3xl relative overflow-hidden bg-white/5 backdrop-blur-xl">
          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-10 right-10 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-white z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-500/40"
              >
                T
              </motion.div>
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
                  {isLogin ? t.login : t.register}
                </h2>
                <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[9px] tracking-widest mt-1">
                  <Sparkles className="w-3 h-3" />
                  Genius Ecosystem
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3" /> {t.name}
                    </label>
                    <input 
                      name="name" 
                      type="text" 
                      required 
                      placeholder="Enter your full name"
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-indigo-500 transition-all text-white font-bold" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="Enter your email"
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-indigo-500 transition-all text-white font-bold" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="Enter your password"
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-indigo-500 transition-all text-white font-bold" 
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-16 rounded-2xl text-lg gap-3 shadow-2xl shadow-indigo-500/20 w-full"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                  {isLogin ? t.login : t.register}
                </Button>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">OR</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <Button 
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError('');
                    try {
                      await signInWithGoogle();
                      onClose();
                    } catch (err: any) {
                      setError(err.message || 'Google Sign-In failed.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="h-16 rounded-2xl text-lg gap-3 bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10 w-full border-none font-black"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {language === 'ru' ? 'ВОЙТИ ЧЕРЕЗ GOOGLE' : 'SIGN IN WITH GOOGLE'}
                </Button>

                <Button 
                  type="button"
                  onClick={handleDemoMode}
                  disabled={loading}
                  className="h-16 rounded-2xl text-lg gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 w-full border-none text-white font-black"
                >
                  <Zap className="w-5 h-5" />
                  {language === 'ru' ? 'ДЕМО РЕЖИМ' : 'DEMO MODE'}
                </Button>
              </div>
            </form>

            <div className="mt-12 pt-10 border-t border-white/10 text-center">
              <p className="text-white/40 font-medium mb-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 font-black uppercase text-xs tracking-widest hover:underline"
              >
                {isLogin ? t.register : t.login}
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-white/20">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Quantum Encryption Active</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
