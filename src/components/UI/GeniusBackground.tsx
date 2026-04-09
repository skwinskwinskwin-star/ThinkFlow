
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const GeniusBackground: React.FC = () => {
  const { geniusMode } = useAuth();
  const { theme } = useTheme();

  if (!geniusMode) return <div className="fixed inset-0 bg-[var(--bg)] z-0" />;
  
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--bg)] transition-colors duration-500">
      {/* Floating 3D-like Orbs */}
      <motion.div
        animate={{
          x: [0, 150, -150, 0],
          y: [0, -150, 150, 0],
          scale: [1, 1.3, 0.7, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] ${
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/30'
        }`}
      />
      
      <motion.div
        animate={{
          x: [0, -200, 200, 0],
          y: [0, 200, -200, 0],
          scale: [1, 0.6, 1.4, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] rounded-full blur-[150px] ${
          isDark ? 'bg-purple-600/20' : 'bg-purple-400/30'
        }`}
      />

      {/* Cyber Grid with 3D Perspective - ENHANCED */}
      <div 
        className="absolute inset-0"
        style={{
          perspective: '1000px',
          overflow: 'hidden'
        }}
      >
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.15]' : 'opacity-[0.25]'}`}
          style={{
            backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: 'rotateX(60deg) translateY(-100px) translateZ(0)',
            transformOrigin: 'top',
            height: '200%',
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)'
          }}
        />
      </div>

      {/* Scanning Line */}
      <motion.div 
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-x-0 h-px ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/40'} blur-sm`}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * (isDark ? 0.5 : 0.8)
          }}
          animate={{
            y: [null, Math.random() * -500],
            opacity: [null, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`}
        />
      ))}
    </div>
  );
};
