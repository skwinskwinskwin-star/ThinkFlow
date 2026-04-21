
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Brain, Sparkles, Target, Users, ArrowRight, Zap, Globe, ShieldCheck, Star, Cpu, Rocket, PlayCircle, Fingerprint, ChevronRight, Activity, Layers, Code, Magnet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { GeniusBackground } from '../UI/GeniusBackground';

interface LandingProps {
  onGetStarted: () => void;
}

const Marquee = ({ children, direction = "left" }: { children: React.ReactNode, direction?: "left" | "right" }) => {
  return (
    <div className="flex overflow-hidden whitespace-nowrap select-none border-y border-white/5 py-4">
      <motion.div 
        animate={{ x: direction === "left" ? [0, -1000] : [-1000, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 items-center"
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex gap-12 items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`${feature.size} group relative`}
    >
      <Card className="h-full p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-[#08080a] group-hover:border-indigo-500/30 transition-all duration-700 relative overflow-hidden flex flex-col justify-between">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-[100px] transition-opacity duration-1000`} />
        
        <div className="relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br ${feature.color} transition-all duration-500`}>
            <feature.icon className="w-7 h-7 text-white/50 group-hover:text-white" />
          </div>
          
          <div className="mt-12">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-6 group-hover:translate-x-2 transition-transform duration-500">
              {feature.title}
            </h3>
            <p className="text-base text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
              {feature.desc}
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 group-hover:opacity-100 transition-all duration-500 translate-y-4 opacity-0 group-hover:translate-y-0">
          {useLanguage().t.exploreSystem} <ArrowRight className="w-3 h-3" />
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

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  const features = [
    { 
      title: t.reactorTitle, 
      desc: t.reactorDesc, 
      icon: Cpu, 
      color: "from-indigo-600 to-blue-600",
      size: "md:col-span-1"
    },
    { 
      title: t.geniusModeTitle, 
      desc: t.geniusModeDesc, 
      icon: Magnet, 
      color: "from-amber-500 to-orange-600",
      size: "md:col-span-1"
    },
    { 
      title: t.biometricsTitle, 
      desc: t.biometricsDesc, 
      icon: Activity, 
      color: "from-emerald-500 to-teal-600",
      size: "md:col-span-1"
    },
    { 
      title: t.hubTitle, 
      desc: t.hubDesc, 
      icon: Layers, 
      color: "from-rose-500 to-purple-600",
      size: "md:col-span-1"
    },
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#020204] text-white selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans"
    >
      <GeniusBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-black/20 backdrop-blur-3xl border border-white/5 rounded-[2rem] px-8 py-4 shadow-2xl">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              T
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic hidden sm:block">Think<span className="text-indigo-500">Flow</span></span>
          </motion.div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              <a href="#features" className="hover:text-white transition-colors">{t.navFeatures}</a>
              <a href="#mission" className="hover:text-white transition-colors">{t.navMission}</a>
              <a href="https://t.me/b_sar_a" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-white transition-colors">{t.navContact}</a>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-2">
              {(['en', 'ru', 'uz'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all border ${
                    language === lang 
                      ? 'bg-white text-black border-white' 
                      : 'text-gray-500 hover:text-white border-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <Button 
              onClick={onGetStarted}
              className="h-11 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 transition-all border-none"
            >
              {t.start}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-32 px-6">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 max-w-7xl mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-12 backdrop-blur-3xl shadow-xl"
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            {t.versionBadge}
          </motion.div>
          
          <div className="relative">
            <h1 className="text-[15vw] md:text-[14rem] font-black uppercase tracking-[-0.06em] leading-[0.75] mb-12 mix-blend-difference">
              <motion.span 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="block text-white"
              >
                {t.heroThink}
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="block italic stroke-text"
              >
                {t.heroBeyond}
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent italic"
              >
                {t.heroGenius}
              </motion.span>
            </h1>
            
            <div className="absolute top-10 right-0 hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 border border-dashed border-white/10 rounded-full flex items-center justify-center p-8"
              >
                <div className="w-full h-full border border-dashed border-indigo-500/20 rounded-full flex items-center justify-center">
                   <div className="text-[10px] font-black tracking-widest text-white/20 uppercase text-center px-4">{t.coreArchitecture}</div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-16 mt-16">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="max-w-xl text-xl md:text-3xl text-gray-500 font-medium leading-relaxed"
            >
              {t.heroSub}
            </motion.p>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <Button 
                onClick={onGetStarted} 
                className="h-28 px-16 rounded-[2.5rem] text-3xl gap-6 bg-indigo-600 hover:bg-indigo-500 shadow-[0_30px_60px_rgba(79,70,229,0.4)] group transition-all duration-700"
              >
                {t.start} 
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Watermark background text removed */}
      </section>

      {/* Marquee Ticker */}
      <section className="py-12 bg-black/40 backdrop-blur-3xl">
        <Marquee>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 whitespace-nowrap">
            {t.marqueeText}
          </span>
        </Marquee>
      </section>

      {/* Grid Section */}
      <section id="features" className="py-32 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-2 lg:row-span-2 p-12 md:p-20 rounded-[3rem] bg-indigo-600 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-12">
                  <Rocket className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-8">
                  {t.builtEra}<br/><span className="text-black/30">{t.nextEra}</span>
                </h2>
                <p className="text-xl text-indigo-100/60 font-medium max-w-sm leading-relaxed">
                  {t.builtEraSub}
                </p>
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="w-full h-16 bg-white text-black hover:bg-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                {t.joinRevolution}
              </Button>

              <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[80px]" />
            </div>

            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* New Split Content Section */}
      <section id="mission" className="py-32 relative border-y border-white/5 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] bg-[#0a0a0c] border border-white/5 flex items-center justify-center p-12 relative group overflow-hidden">
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, #4f46e5 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
              <div className="relative z-10 space-y-8 w-full">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-500 flex items-center justify-center font-black">
                        0{i}
                      </div>
                      <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '70%' }}
                          transition={{ duration: 2, delay: 1 }}
                          className="h-full bg-indigo-500" 
                        />
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="inline-flex items-center gap-3 text-indigo-500 font-bold uppercase tracking-[0.5em] text-[11px]">
              <Target className="w-4 h-4" />
              {t.ourMission}
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              {t.missionStop} <span className="text-gray-700">{t.missionMemorizing}</span><br/>
              {t.missionStart} <span className="text-white">{t.missionGrowing}</span>
            </h2>

            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              {t.missionSub}
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <div className="text-5xl font-black text-white mb-2">3.5X</div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">{t.speedBoost}</div>
              </div>
              <div>
                <div className="text-5xl font-black text-white mb-2">98%</div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">{t.retention}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Me Section */}
      <section id="contact" className="py-32 relative bg-indigo-600 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="relative z-10 text-left">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white mb-8">
              {t.contactMeSection}
            </h2>
            <p className="text-xl text-indigo-100 font-medium mb-12 max-w-lg leading-relaxed">
              {t.contactMeSub}
            </p>
            <a 
              href="https://t.me/b_sar_a" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 h-24 px-12 rounded-[2.5rem] bg-white text-black hover:bg-gray-100 text-2xl font-black uppercase tracking-widest transition-all"
            >
              <Zap className="w-8 h-8 fill-indigo-600 text-indigo-600" />
              {t.telegramButton}
            </a>
          </div>
          
          <div className="relative hidden md:block group">
            <div className="aspect-square rounded-[4rem] border-2 border-white/20 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-64 h-64 bg-white/20 rounded-full blur-[80px]"
              />
              <Target className="w-48 h-48 text-white/50 group-hover:scale-110 group-hover:text-white transition-all duration-700" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px]" />
      </section>

      {/* CTA Footer */}
      <section className="py-40 px-6 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10 space-y-12">
          <h2 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-none">
            {t.readyToAscend.split(' ')[0]} <span className="text-indigo-600">{t.readyToAscend.split(' ')[1]} {t.readyToAscend.split(' ')[2]}</span>
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Button 
              onClick={onGetStarted}
              className="h-24 px-20 rounded-[2.5rem] bg-white text-black hover:bg-gray-100 text-2xl font-black uppercase tracking-widest transition-all"
            >
              {t.start}
            </Button>
          </div>
        </div>
        
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-[1200px] h-[1200px] bg-indigo-600/5 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-indigo-500/20 shadow-lg">T</div>
              <span className="text-xl font-black uppercase tracking-tighter italic">Think<span className="text-indigo-500">Flow</span></span>
            </div>
            
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <a href="https://t.me/b_sar_a" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-white transition-colors">{t.navContact}</a>
              <a href="#" className="hover:text-white transition-colors">{t.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.security}</a>
              <a href="#" className="hover:text-white transition-colors">{t.contactFooter}</a>
            </div>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            <span>{t.copyright}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
