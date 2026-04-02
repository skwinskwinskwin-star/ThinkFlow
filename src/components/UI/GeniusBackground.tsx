
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const GeniusBackground: React.FC = () => {
  const { geniusMode } = useAuth();
  const { theme } = useTheme();

  if (!geniusMode) return <div className="fixed inset-0 bg-[var(--bg)] -z-10" />;
  
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--background)] transition-colors duration-500">
      {/* Floating 3D-like Orbs */}
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] ${
          isDark ? 'bg-indigo-600/10' : 'bg-indigo-400/15'
        }`}
      />
      
      <motion.div
        animate={{
          x: [0, -150, 150, 0],
          y: [0, 150, -150, 0],
          scale: [1, 0.7, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full blur-[200px] ${
          isDark ? 'bg-purple-600/10' : 'bg-purple-400/15'
        }`}
      />

      {/* Cyber Grid with 3D Perspective */}
      <div 
        className={`absolute inset-0 ${isDark ? 'opacity-[0.05]' : 'opacity-[0.1]'}`}
        style={{
          backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          transform: 'perspective(1000px) rotateX(65deg) translateY(-200px)',
          transformOrigin: 'top',
          maskImage: 'linear-gradient(to bottom, black, transparent)'
        }}
      />

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
