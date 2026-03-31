
import React from 'react';
import { Quote as QuoteIcon, Sparkles, BookOpen, Atom, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_QUOTES } from '../../constants';
import { Card } from '../UI/Card';

export const Quotes: React.FC = () => {
  const { t } = useLanguage();

  const getIcon = (category: string) => {
    switch (category) {
      case 'learning': return <BookOpen className="w-10 h-10 text-indigo-500" />;
      case 'thinking': return <Sparkles className="w-10 h-10 text-purple-500" />;
      case 'education': return <GraduationCap className="w-10 h-10 text-emerald-500" />;
      case 'science': return <Atom className="w-10 h-10 text-rose-500" />;
      default: return <QuoteIcon className="w-10 h-10 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.quotes}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Inspiration from the world's greatest thinkers.
          </p>
        </div>
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <QuoteIcon className="w-10 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {INITIAL_QUOTES.map((quote) => (
          <Card 
            key={quote.id} 
            hover 
            className="flex flex-col h-full group p-12 rounded-[4rem] relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              {getIcon(quote.category)}
            </div>
            
            <QuoteIcon className="w-12 h-12 text-indigo-500/20 mb-8" />
            
            <p className="text-2xl md:text-3xl font-black italic leading-tight mb-10 text-[var(--text)] flex-1">
              "{quote.text}"
            </p>

            <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tighter text-[var(--text)]">{quote.author}</span>
                <span className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">{quote.category}</span>
              </div>
              <div className="w-12 h-12 bg-[var(--input)] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {getIcon(quote.category)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-16 rounded-[4rem] text-center text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="w-20 h-20 mx-auto mb-8 text-white/50" />
        <h3 className="text-4xl font-black italic relative z-10">
          "Thinking is the hardest work there is, which is probably the reason why so few engage in it."
        </h3>
        <p className="mt-8 text-[10px] font-black uppercase tracking-widest opacity-60">
          Henry Ford
        </p>
      </div>
    </div>
  );
};
