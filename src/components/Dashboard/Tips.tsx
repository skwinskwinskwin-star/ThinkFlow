
import React from 'react';
import { Lightbulb, Clock, BookOpen, CheckCircle2, ArrowRight, Star, Target, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';

export const Tips: React.FC = () => {
  const { t } = useLanguage();

  const satTips = [
    { title: "Time Management", desc: "Learn how to allocate time per question to ensure you finish each section.", icon: Clock },
    { title: "Math Shortcuts", desc: "Master mental math and calculator tricks for common SAT problems.", icon: Zap },
    { title: "Reading Strategies", desc: "Techniques for active reading and finding evidence in the text.", icon: BookOpen },
    { title: "Vocabulary in Context", desc: "How to deduce word meanings from surrounding sentences.", icon: Target },
  ];

  const ieltsTips = [
    { title: "Speaking Fluency", desc: "Practice speaking at length and using a wide range of vocabulary.", icon: Star },
    { title: "Writing Structure", desc: "How to organize your essays for maximum coherence and cohesion.", icon: CheckCircle2 },
    { title: "Listening Focus", desc: "Tips for staying focused and predicting answers during the test.", icon: Target },
    { title: "Reading Scanning", desc: "Master the art of skimming and scanning for specific information.", icon: BookOpen },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-6xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.tips}
          </h2>
          <p className="text-[var(--muted)] font-medium max-w-2xl text-lg">
            Expert advice and strategies to help you master international exams and improve your reasoning skills.
          </p>
        </div>
        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 shadow-inner">
          <Lightbulb className="w-12 h-12" />
        </div>
      </div>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <span className="font-black text-2xl">SAT</span>
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight text-[var(--text)]">{t.sat}</h3>
            <p className="text-[var(--muted)] text-sm font-medium">{t.satTips}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {satTips.map((tip, i) => (
            <Card key={i} hover className="p-8 rounded-[2.5rem] group cursor-pointer flex flex-col">
              <div className="w-14 h-14 bg-[var(--input)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <tip.icon className="w-6 h-6 text-indigo-500" />
              </div>
              <h4 className="text-xl font-black mb-3 text-[var(--text)] group-hover:text-indigo-500 transition-colors">{tip.title}</h4>
              <p className="text-[var(--muted)] text-xs leading-relaxed mb-6 flex-1">{tip.desc}</p>
              <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-2 transition-transform" />
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <span className="font-black text-2xl">IELTS</span>
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight text-[var(--text)]">{t.ielts}</h3>
            <p className="text-[var(--muted)] text-sm font-medium">{t.ieltsTips}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ieltsTips.map((tip, i) => (
            <Card key={i} hover className="p-8 rounded-[2.5rem] group cursor-pointer flex flex-col">
              <div className="w-14 h-14 bg-[var(--input)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <tip.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-xl font-black mb-3 text-[var(--text)] group-hover:text-emerald-500 transition-colors">{tip.title}</h4>
              <p className="text-[var(--muted)] text-xs leading-relaxed mb-6 flex-1">{tip.desc}</p>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-2 transition-transform" />
            </Card>
          ))}
        </div>
      </section>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-40 h-40 bg-white/10 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl shrink-0 relative z-10">
          💡
        </div>
        <div className="space-y-6 relative z-10">
          <h3 className="text-3xl font-black uppercase tracking-tighter">Pro Tip: The Socratic Loop</h3>
          <p className="text-white/80 leading-relaxed text-lg font-medium">
            When studying, don't just read the answer. Ask yourself "Why?" three times. If you can explain the logic to a 5-year-old, you've truly mastered the concept. ThinkFlow is designed to help you build this habit.
          </p>
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Reasoning</span>
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Logic</span>
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
