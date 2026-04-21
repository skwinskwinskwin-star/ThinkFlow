
import React, { useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const GeniusBackground: React.FC = () => {
  const { geniusMode } = useAuth();
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Use springs for smooth parallax
  const springX = useSpring(mousePos.x * 50, { stiffness: 50, damping: 20 });
  const springY = useSpring(mousePos.y * 50, { stiffness: 50, damping: 20 });

  // Floating Binary Strings for 'Code Rain' effect
  const binaryStreams = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * -20,
    opacity: Math.random() * 0.1 + 0.05,
    fontSize: Math.random() * 8 + 6,
    content: [...Array(20)].map(() => (Math.random() > 0.5 ? '1' : '0')).join('')
  })), []);

  const particles = useMemo(() => [...Array(40)].map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * -20,
    blur: Math.random() * 2
  })), []);

  // Holographic Rings Configuration
  const rings = useMemo(() => [...Array(3)].map((_, i) => ({
    id: i,
    size: 400 + i * 200,
    duration: 20 + i * 10,
    rotateZ: Math.random() * 360,
    opacity: 0.1 - i * 0.02
  })), []);

  if (!geniusMode) return <div className="fixed inset-0 bg-[var(--bg)] z-0" />;
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#020205] transition-colors duration-1000">
      {/* Dynamic Color Aura - Shifts between Indigo and Deep Violet */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 50% 40%, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 40%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 40%, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0"
      />

      {/* Code Rain - Vertical Binary Streams */}
      {binaryStreams.map((s) => (
        <motion.div
          key={`binary-${s.id}`}
          initial={{ y: -500 }}
          animate={{ y: window.innerHeight + 500 }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            left: s.left,
            opacity: s.opacity,
            fontSize: s.fontSize,
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
          }}
          className="font-mono text-indigo-400/40 font-bold select-none pointer-events-none z-0"
        >
          {s.content}
        </motion.div>
      ))}

      {/* Dynamic Parallax Atmosphere */}
      <motion.div 
        style={{ x: springX, y: springY }}
        className="absolute inset-[-15%] bg-[radial-gradient(circle_at_50%_40%,_#1a1b4b_0%,_transparent_75%)] opacity-70 blur-[80px] pointer-events-none"
      />

      {/* 3D Holographic Rings */}
      <div className="absolute inset-x-0 top-[40%] flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
        {rings.map((ring) => (
          <motion.div
            key={`ring-${ring.id}`}
            animate={{ 
              rotateZ: [ring.rotateZ, ring.rotateZ + 360],
              rotateX: [65, 75, 65],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: ring.size,
              height: ring.size,
              border: `1px solid rgba(99, 102, 241, ${ring.opacity})`,
              borderRadius: '50%',
              boxShadow: `inset 0 0 40px rgba(99, 102, 241, ${ring.opacity / 2})`,
            }}
          />
        ))}
      </div>

      {/* Floating 3D Orbs - Enhanced with Parallax */}

      {/* Floating 3D Orbs - Enhanced with Parallax */}
      <motion.div
        animate={{
          x: [-50, 50],
          y: [-50, 50],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{ x: springX, y: springY }}
        className="absolute top-[5%] left-[5%] w-[70vw] h-[70vw] rounded-full blur-[150px] bg-indigo-600/10 mix-blend-screen pointer-events-none"
      />
      
      <motion.div
        animate={{
          x: [50, -50],
          y: [50, -50],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{ x: springX, y: springY }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] bg-purple-600/10 mix-blend-screen pointer-events-none"
      />

      {/* Hexagon Grid Overlay - Subltle & Technical */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 104V86.6025M0 86.6025L15 77.9423M60 86.6025L45 77.9423M0 17.3205L15 26.0603M60 17.3205L45 26.0603M30 0V17.3205M15 26.0603V43.3408L0 52L15 60.6592V77.9423L30 86.6025L45 77.9423V60.6592L60 52L45 43.3408V26.0603L30 17.3205L15 26.0603Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 208px'
        }}
      />

      {/* 3D Grid Floor - Polished with Horizon Bloom */}
      <div 
        className="absolute inset-0"
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        <motion.div 
          className="absolute inset-0 origin-center"
          style={{
            x: springX, 
            y: springY,
            backgroundImage: `
              linear-gradient(to right, rgba(79, 70, 229, 0.15) 1.5px, transparent 1.5px),
              linear-gradient(to bottom, rgba(79, 70, 229, 0.15) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '80px 80px',
            transform: 'rotateX(75deg) translateY(-25%) translateZ(-150px)',
            height: '250%',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 65%, transparent)'
          }}
        />

        {/* Cyber Horizon Glow */}
        <div className="absolute inset-x-0 top-1/2 h-[2px] bg-indigo-500 shadow-[0_0_60px_5px_rgba(99,102,241,0.6)] opacity-50 translate-z-0" />
      </div>

      {/* Floating Data Artifacts (Digital Stars) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            translateY: [0, -150]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          className="bg-indigo-200 rounded-full blur-[0.5px] shadow-[0_0_12px_rgba(165,180,252,0.9)]"
        />
      ))}

      {/* Pulsing Neural Nodes */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`node-${i}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: i * 3,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
          }}
          className="absolute w-32 h-32 rounded-full border border-indigo-500/20 blur-xl"
        />
      ))}

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_3px,3px_100%]" />

      {/* Final Texture & Grain */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
