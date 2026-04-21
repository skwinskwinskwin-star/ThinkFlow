
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const GeniusBackground: React.FC = () => {
  const { geniusMode } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  // Memoize random particles to prevent re-renders
  const particles = useMemo(() => [...Array(30)].map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * -20
  })), []);

  if (!geniusMode) return <div className="fixed inset-0 bg-[var(--bg)] z-0" />;
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#020205] transition-colors duration-1000">
      {/* Deep Space Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#1a1a3a_0%,_transparent_50%)] opacity-40" />

      {/* Atmospheric Orbs - More dynamic and layered */}
      <motion.div
        animate={{
          x: [-100, 100],
          y: [-100, 100],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] bg-indigo-600/10 mix-blend-screen"
      />
      
      <motion.div
        animate={{
          x: [100, -100],
          y: [100, -100],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute bottom-[0%] right-[0%] w-[50vw] h-[50vw] rounded-full blur-[140px] bg-purple-600/10 mix-blend-screen"
      />

      {/* 3D Grid Floor - Classic Sci-Fi */}
      <div 
        className="absolute inset-0"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        <div 
          className="absolute inset-0 origin-center"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: 'rotateX(75deg) translateY(-20%) translateZ(-100px)',
            height: '200%',
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 60%, transparent)'
          }}
        />

        {/* Glow at the horizon */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-indigo-500 shadow-[0_0_40px_2px_rgba(99,102,241,0.5)] opacity-40 translate-z-0" />
      </div>

      {/* Digital Starfield */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
            y: [0, -100]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          className="bg-indigo-300 rounded-full blur-[1px] shadow-[0_0_8px_rgba(165,180,252,0.8)]"
        />
      ))}

      {/* Vertical 'Data Streams' */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-200, window.innerHeight + 200],
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * -5,
            ease: "linear"
          }}
          style={{
            left: `${15 + i * 18}%`,
          }}
          className="absolute w-px h-64 bg-gradient-to-b from-transparent via-indigo-500 to-transparent blur-[1px]"
        />
      ))}

      {/* Surface Grain for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
