
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, Users, BookOpen, Quote, ArrowRight, Star, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const { t } = useLanguage();

  const features = [
    { title: "AI-Guided Learning", desc: "Our AI doesn't just give answers; it teaches you how to think and solve problems step-by-step.", icon: Brain, color: "text-indigo-500" },
    { title: "Interest-Based Context", desc: "Learn complex concepts through your favorite topics like Football, Anime, or Gaming.", icon: Sparkles, color: "text-purple-500" },
    { title: "Progress Tracking", desc: "Earn XP, level up, and climb the leaderboard as you master new subjects.", icon: Target, color: "text-emerald-500" },
    { title: "Global Community", desc: "Connect with students worldwide and share your learning journey.", icon: Users, color: "text-rose-500" },
  ];

  const stats = [
    { label: "Aha! Moments", value: "Endless", icon: Sparkles },
    { label: "Learning Path", value: "Unique", icon: Target },
    { label: "Understanding", value: "Deep", icon: Brain },
    { label: "Growth", value: "Constant", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-widest mb-8 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
              Revolutionizing Education
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-[var(--text)] mb-10">
              Think <span className="text-indigo-600">Flow</span><br />
              <span className="text-[var(--muted)]">Not Just Answers.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-[var(--muted)] font-medium mb-12 leading-relaxed">
              The AI-powered learning platform that helps students master subjects through reasoning, guidance, and personal interests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button onClick={onGetStarted} className="h-20 px-12 rounded-[2rem] text-xl gap-3 shadow-2xl shadow-indigo-500/40">
                Get Started <ArrowRight className="w-6 h-6" />
              </Button>
              <Button variant="outline" className="h-20 px-12 rounded-[2rem] text-xl border-[var(--border)]">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-indigo-500 mb-2">
                  <stat.icon className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-5xl font-black text-[var(--text)] tracking-tighter">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[var(--text)] mb-6">
              Why ThinkFlow?
            </h2>
            <p className="text-[var(--muted)] font-medium max-w-xl mx-auto">
              We believe education should be about understanding, not memorizing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <Card key={i} hover className="p-12 rounded-[4rem] border border-[var(--border)] group">
                <div className={`w-20 h-20 rounded-[2rem] bg-[var(--input)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--text)] mb-4">{feature.title}</h3>
                <p className="text-[var(--muted)] text-lg leading-relaxed font-medium">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 bg-[var(--input)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[var(--card)] p-16 md:p-24 rounded-[5rem] shadow-2xl border border-[var(--border)] relative overflow-hidden">
            <Quote className="absolute top-10 left-10 w-32 h-32 text-indigo-500/5" />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-10">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-6 h-6 text-yellow-500 fill-yellow-500" />)}
              </div>
              <p className="text-3xl md:text-5xl font-black italic leading-tight text-[var(--text)] mb-12">
                "ThinkFlow changed the way I look at Algebra. Instead of just formulas, I now understand the 'why' behind them."
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">S</div>
                  <div className="text-left">
                    <h4 className="font-black uppercase tracking-tighter text-[var(--text)]">Sharifganov Shokhruz</h4>
                    <p className="text-xs font-black uppercase text-[var(--muted)] tracking-widest">9B Student</p>
                  </div>
                </div>
                <div className="w-px h-12 bg-[var(--border)] hidden md:block" />
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">B</div>
                  <div className="text-left">
                    <h4 className="font-black uppercase tracking-tighter text-[var(--text)]">Babaev Bekhruz</h4>
                    <p className="text-xs font-black uppercase text-[var(--muted)] tracking-widest">9B Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer removed per user request */}
    </div>
  );
};
