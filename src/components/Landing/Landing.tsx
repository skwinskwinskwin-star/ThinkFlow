
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Brain, Sparkles, Target, Users, ArrowRight, Zap, Globe, ShieldCheck, Star, Cpu, Rocket, PlayCircle, Fingerprint, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { GeniusBackground } from '../UI/GeniusBackground';

interface LandingProps {
  onGetStarted: () => void;
}

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={feature.size || ""}
    >
      <Card className="h-full p-10 rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-3xl group hover:border-indigo-500/50 transition-all relative overflow-hidden flex flex-col justify-between">
        <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-[80px] transition-opacity duration-700`} />
        
        <div className="relative z-10">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
            <feature.icon className="w-8 h-8 text-white" />
          </div>
          
          <div className="mt-10">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4 group-hover:text-indigo-500 transition-colors">
              {feature.title}
            </h3>
            <p className="text-lg text-gray-400 leading-relaxed font-medium group-hover:text-white transition-colors">
              {feature.desc}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {useLanguage().t.exploreSystem} <ChevronRight className="w-3 h-3" />
        </div>
      </Card>
    </motion.div>
  );
};

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const { t, language, setLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.1], [0, -100]);
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  const features = [
    { 
      title: t.reactorTitle, 
      desc: t.reactorDesc, 
      icon: Cpu, 
      color: "from-indigo-600 to-blue-600",
      size: "col-span-1 md:col-span-1"
    },
    { 
      title: t.geniusModeTitle, 
      desc: t.geniusModeDesc, 
      icon: Zap, 
      color: "from-amber-500 to-orange-600",
      size: "col-span-1 md:col-span-1"
    },
    { 
      title: t.biometricsTitle, 
      desc: t.biometricsDesc, 
      icon: Fingerprint, 
      color: "from-emerald-500 to-teal-600",
      size: "col-span-1 md:col-span-1"
    },
    { 
      title: t.hubTitle, 
      desc: t.hubDesc, 
      icon: Globe, 
      color: "from-rose-500 to-purple-600",
      size: "col-span-1 md:col-span-1"
    },
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#020205] text-white selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans"
    >
      <GeniusBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 md:px-12 flex items-center justify-between max-w-7xl mx-auto">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            T
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Think<span className="text-indigo-500">Flow</span></span>
        </motion.div>
        
        <div className="flex items-center gap-6">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
            {(['en', 'ru', 'uz'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full transition-all ${
                  language === lang 
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button 
            onClick={onGetStarted}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            {t.login}
          </button>
          <Button 
            onClick={onGetStarted}
            className="h-12 px-8 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-all"
          >
            {t.start}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        <motion.div 
          style={{ opacity, scale: springScale, y }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mb-6 backdrop-blur-md"
          >
            <Zap className="w-3 h-3 fill-current" />
            {t.nextGenAI}
          </motion.div>
          
          <h1 className="text-[12vw] md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-4">
            <span className="block text-white">{t.beyondGenius.split(' ')[0]}</span>
            <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{t.beyondGenius.split(' ')[1] || 'GENIUS'}</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium mb-6 leading-relaxed">
            {t.heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={onGetStarted} 
              className="h-20 px-12 rounded-2xl text-xl gap-4 bg-indigo-600 hover:bg-indigo-500 shadow-[0_20px_50px_rgba(79,70,229,0.3)] group"
            >
              {t.start} 
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <button 
              onClick={onGetStarted}
              className="flex items-center gap-4 h-20 px-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              <PlayCircle className="w-6 h-6 text-indigo-500" />
              <span className="text-lg font-black uppercase tracking-widest">{t.demo}</span>
            </button>
          </div>
        </motion.div>

        {/* Portal Visual Effect */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-[800px] h-[800px] border border-white/5 rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.1, 0.05],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-[600px] h-[600px] border border-indigo-500/10 rounded-full" 
          />
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-12 relative z-10 px-6 bg-[#020205]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
              {t.coreEngine.split(' ')[0]} <span className="text-indigo-500">{t.coreEngine.split(' ')[1]}</span> {t.coreEngine.split(' ')[2]}
            </h2>
            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px]">
              {t.coreEngineSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Showcase */}
      <section className="py-16 relative overflow-hidden bg-[#020205]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                <Brain className="w-10 h-10" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                {t.stopMemorizing.split(' ')[0]} <span className="text-indigo-500">{t.stopMemorizing.split(' ')[1]}</span><br />
                {t.startFlowing.split(' ')[0]} <span className="text-purple-500">{t.startFlowing.split(' ')[1]}</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed font-medium">
                {t.educationBroken}
              </p>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-indigo-500">98%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.retentionRate}</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-4xl font-black text-purple-500">3.5x</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.learningSpeed}</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="aspect-square bg-indigo-600/5 rounded-[4rem] border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 border-2 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center"
                  >
                    <div className="w-48 h-48 border-2 border-dashed border-purple-500/30 rounded-full" />
                  </motion.div>
                  <Brain className="w-24 h-24 text-white absolute z-10 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#020205] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">T</div>
            <span className="text-xl font-black uppercase tracking-tighter">ThinkFlow</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t.secure}</span>
            <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> {t.global}</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
