
import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Please check your internet connection or try a different browser/network. This can also happen if your browser blocks Firebase domains.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Please check your connection. Google Sign-In might be blocked by your network or browser extensions.');
      } else {
        setError(err.message || 'Google Sign-In failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-2xl animate-in fade-in duration-500">
      <Card className="w-full max-w-xl p-12 md:p-16 rounded-[4rem] border border-[var(--border)] shadow-3xl relative overflow-hidden bg-[var(--card)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 p-4 rounded-2xl bg-[var(--input)] hover:bg-[var(--border)] transition-colors text-[var(--text)]"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-500/20">
              T
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text)]">
                {isLogin ? t.login : t.register}
              </h2>
              <p className="text-[var(--muted)] font-medium text-sm">Welcome to ThinkFlow ecosystem.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> {t.name}
                </label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Enter your full name"
                  className="w-full h-16 bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 outline-none focus:border-indigo-500 transition-all text-[var(--text)]" 
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="Enter your email"
                className="w-full h-16 bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 outline-none focus:border-indigo-500 transition-all text-[var(--text)]" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3" /> Password
              </label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="Enter your password"
                className="w-full h-16 bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 outline-none focus:border-indigo-500 transition-all text-[var(--text)]" 
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-20 rounded-[2rem] text-lg gap-3 shadow-2xl shadow-indigo-500/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
              {isLogin ? t.login : t.register}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-[var(--border)]"></div>
              <span className="flex-shrink mx-4 text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-[var(--border)]"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-16 rounded-2xl gap-3 border-[var(--border)] text-[var(--text)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="mt-12 pt-10 border-t border-[var(--border)] text-center">
            <p className="text-[var(--muted)] font-medium mb-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline"
            >
              {isLogin ? t.register : t.login}
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-[var(--muted)]">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Secure Authentication System</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
