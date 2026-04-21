
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Target, Zap, ArrowRight, Loader2, CheckCircle2, ChevronRight, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { generateKnowledgeTree, verifyTask } from '../../services/gemini';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KnowledgeTree, KnowledgeNode } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Chat } from './Chat';

export const GeniusLab: React.FC = () => {
  const { profile, updateProfileData, user } = useAuth();
  const { language, t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [tree, setTree] = useState<KnowledgeTree | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [floatingXP, setFloatingXP] = useState<{ id: number; amount: number }[]>([]);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Particle Explosion Effect for XP
  const [xpParticles, setXpParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const addXPAction = async (amount: number) => {
    if (!profile || !user) return;
    const newXP = (profile.xp || 0) + amount;
    
    const newLevel = Math.floor(Math.sqrt(newXP) / 5) + 1;
    
    await updateProfileData({ 
      xp: newXP, 
      level: newLevel > profile.level ? newLevel : profile.level 
    });

    // XP Particle Explosion - RAINBOW ENERGT
    const particles = [...Array(15)].map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      color: i % 3 === 0 ? 'text-emerald-400' : i % 3 === 1 ? 'text-purple-400' : 'text-indigo-400'
    }));
    setXpParticles(particles);
    setTimeout(() => setXpParticles([]), 2000);

    const id = Date.now();
    setFloatingXP(prev => [...prev, { id, amount }]);
    setTimeout(() => {
      setFloatingXP(prev => prev.filter(x => x.id !== id));
    }, 2000);
  };

  const handleInitialize = async () => {
    if (!topic.trim() || !profile) return;
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setVerifyFeedback(null);
    setChallengeAnswer('');
    try {
      const generatedTree = await generateKnowledgeTree(topic, profile);
      if (generatedTree && Array.isArray(generatedTree.nodes) && generatedTree.nodes.length > 0) {
        setTree(generatedTree);
        setSelectedNode(generatedTree.nodes[0]);
        addXPAction(25);
      } else {
        throw new Error("Invalid structure: AI returned empty tree.");
      }
    } catch (err) {
      console.error("Genius Lab Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to initialize lab";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setChallengeAnswer('');
    setVerifyFeedback(null);
  };

  const handleCompleteChallenge = async () => {
    if (!selectedNode || !selectedNode.points || !challengeAnswer.trim() || !profile) return;
    
    setIsVerifying(true);
    setVerifyFeedback(null);
    
    try {
      const result = await verifyTask(selectedNode, challengeAnswer, profile);
      
      setVerifyFeedback({ isCorrect: result.isCorrect, text: result.feedback });
      
      if (result.isCorrect) {
        const totalAward = (selectedNode.points || 0) + (result.bonusXP || 0);
        await addXPAction(totalAward);
        
        if (tree) {
          setTree({
            ...tree,
            nodes: tree.nodes.map(n => n.id === selectedNode.id ? { ...n, completed: true } : n)
          });
        }
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError("AI Verification failed. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetLab = () => {
    setTree(null);
    setSelectedNode(null);
    setTopic('');
    setShowChat(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#020205] overflow-hidden">
        {/* Deep Space Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(79,70,229,0.15)_0%,_transparent_60%)]" />

        {/* Floating XP Context */}
        <AnimatePresence>
          {floatingXP.map(xp => (
            <motion.div
              key={xp.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -100 }}
              exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 z-[100] text-emerald-400 font-black text-5xl pointer-events-none drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]"
            >
              +{xp.amount} XP
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="w-full max-w-4xl space-y-16 relative">
          {/* WOW NEURAL SCAN ANIMATION - ENHANCED */}
          <div className="relative flex flex-col items-center">
            {/* Energy Fields */}
            <motion.div 
               animate={{ 
                 scale: [1, 1.4, 1],
                 opacity: [0.1, 0.3, 0.1]
               }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px]"
            />

            {/* Outer Rings */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.05, 1] }}
                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                className="absolute border border-indigo-500/30 rounded-full"
                style={{ 
                  width: `${350 + i * 100}px`, 
                  height: `${350 + i * 100}px`,
                  borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
                  opacity: 0.5 - (i * 0.1)
                }}
              />
            ))}

            {/* Pulsing Core */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1], rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity }}
              className="w-56 h-56 rounded-[3rem] bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-3xl flex items-center justify-center border border-white/20 shadow-[0_0_80px_rgba(79,70,229,0.5)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <Brain className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,1)]" />
            </motion.div>

            {/* Orbiting Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 6 + (i % 3), repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  width: '400px',
                  height: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  transform: `rotate(${i * 30}deg)`
                }}
              >
                <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]" />
              </motion.div>
            ))}
          </div>

          <div className="space-y-10 font-mono text-center relative z-10">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-white tracking-[0.3em] uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {t.constructingKnowledge}
              </h2>
              <p className="text-indigo-400/60 text-sm font-black tracking-widest uppercase">
                {t.synthesizingNode} <span className="text-white border-b-2 border-indigo-500 pb-1 px-2">{topic}</span>
              </p>
            </div>
            
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex justify-between text-[11px] text-indigo-400 font-black tracking-widest">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  {t.systemOptimizing}
                </span>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1 }}
                >
                  NEURAL LINK ESTABLISHED
                </motion.span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 12, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 animate-gradient-x rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: t.deepUnderstanding, status: 'MAPPING' },
                { label: t.personalizedMetaphors, status: 'ENCODING' },
                { label: t.skillMastery, status: 'SCAFFOLDING' },
                { label: t.knowledgeMap, status: 'FLUIDIZING' }
              ].map((step, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.4 }}
                  key={idx} 
                  className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{step.label}</div>
                  <div className="text-sm font-black text-indigo-400 tracking-tighter">{step.status}...</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ambient Data Logs for 'Cyber' immersion
  const dataLogs = [
    "NEURAL_LINK_ESTABLISHED",
    "DECODER_READY_STATE:_ACTIVE",
    "SYNCING_METAPHOR_MATRIX...",
    "KNOWLEDGE_TREE_DEPTH:_6",
    "BRAIN_WAVE_CONSISTENCY:_98%",
    "ENFORCING_COGNITIVE_SCAFFOLDING",
    "FETCHING_GENIUS_INSIGHTS...",
    "DATA_STREAM_POLLING:_TRUE",
    "VIRTUAL_NEURONS:_1024",
    "AI_CORE_TEMPERATURE:_STABLE"
  ];

  if (!tree) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center pt-24 md:pt-40 pb-20 p-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-16 text-center"
        >
          <div className="space-y-6 relative">
            {/* Holographic Particles around Title */}
            <div className="absolute inset-x-0 -top-20 pointer-events-none flex justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 border-2 border-dashed border-indigo-500/20 rounded-full blur-sm"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/10">
                <Zap className="w-5 h-5 fill-current" />
                {t.nextGenAI} [v7.0]
              </div>
              {profile?.geniusMode && (
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10"
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                  {t.geniusModeActive}
                </motion.div>
              )}
            </div>

              <h1 className="relative inline-block text-6xl md:text-9xl font-black uppercase tracking-tighter italic">
                <span className="relative z-10 text-white mix-blend-overlay">Genius</span>
                <span className="text-indigo-500 drop-shadow-[0_0_50px_rgba(99,102,241,0.8)] px-4">Lab</span>
                
                {/* Chromatic Aberration Layers */}
                <motion.span
                  animate={{ x: [-1, 1, -1], y: [1, -1, 1], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                  className="absolute inset-0 text-rose-500 italic -z-10 translate-x-1"
                >
                  Genius Lab
                </motion.span>
                <motion.span
                  animate={{ x: [1, -1, 1], y: [-1, 1, -1], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }}
                  className="absolute inset-0 text-cyan-500 italic -z-10 -translate-x-1"
                >
                  Genius Lab
                </motion.span>
              </h1>
            
            <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              {t.geniusLabSub}
            </p>
          </div>

          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Card className="p-3 rounded-[3rem] bg-black/40 border border-white/10 backdrop-blur-2xl relative">
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInitialize()}
                  placeholder={t.masterTopic}
                  className="flex-1 bg-transparent px-10 py-8 outline-none text-2xl font-black text-white placeholder:text-gray-700"
                />
                <Button 
                  onClick={handleInitialize}
                  disabled={isLoading || !topic.trim()}
                  className="h-auto py-8 px-14 rounded-[2.5rem] text-xl gap-4 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/40 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      {t.initialize} <Sparkles className="w-6 h-6" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 text-rose-400 text-sm font-bold flex flex-col items-center gap-6 max-w-xl mx-auto backdrop-blur-xl"
            >
              <div className="flex items-start gap-4 text-left w-full">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-xl uppercase tracking-tighter font-black">{t.systemFailure}</p>
                  <p className="opacity-80 font-medium leading-relaxed">{error}</p>
                  {debugInfo && (
                    <div className="mt-4 p-4 bg-black/40 rounded-xl text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                      <p className="font-bold mb-1 text-white">DIAGNOSTICS:</p>
                      <p>Env Keys: {debugInfo.envKeys?.join(', ') || 'none'}</p>
                      <p>Has Key: {String(debugInfo.hasApiKey)}</p>
                      <p>Key Length: {debugInfo.apiKeyLength}</p>
                      <p className="mt-2 text-rose-300 italic">If 'Has Key' is false, please re-add API_KEY in Settings and RESTART the server.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-white text-black hover:bg-gray-200 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]"
              >
                {t.tryAgain}
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { icon: Brain, label: t.deepUnderstanding, desc: t.deepUnderstandingDesc },
              { icon: Sparkles, label: t.personalizedMetaphors, desc: t.personalizedMetaphorsDesc },
              { icon: Target, label: t.skillMastery, desc: t.skillMasteryDesc }
            ].map((item, i) => (
              <div key={i} className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/5">
                <item.icon className="w-6 h-6 text-indigo-500 mx-auto" />
                <h4 className="text-xs font-black uppercase tracking-widest text-white">{item.label}</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 p-4 md:p-8 relative">
      {/* Background Neural Overlay for Lab */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(79,70,229,0.1)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
      </div>

      {/* Floating XP Context for Main View */}
      <AnimatePresence>
        {floatingXP.map(xp => (
          <motion.div
            key={xp.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -200 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-32 right-12 z-[100] text-emerald-400 font-black text-6xl pointer-events-none drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]"
          >
            +{xp.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Knowledge Map Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4 relative z-10">
        {/* Neural Console Overlay (WOW FACTOR) */}
        <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-xl mb-4 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-2 opacity-30">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <Zap className="w-3 h-3 text-indigo-400" />
            </motion.div>
          </div>
          <div className="space-y-1.5 h-24 overflow-hidden font-mono text-[8px] text-indigo-400/60 leading-tight">
            {dataLogs.concat(dataLogs).map((log, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -100] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
              >
                {`> ${log}`}
              </motion.div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#020205] to-transparent pointer-events-none" />
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400/60">{t.knowledgeMap}</h3>
            <div className="h-0.5 w-12 bg-indigo-500 rounded-full" />
          </div>
          <button 
            onClick={resetLab} 
            className="px-4 py-1.5 rounded-full border border-indigo-500/30 text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 transition-colors shadow-lg shadow-indigo-500/5 backdrop-blur-md"
          >
            {t.newTopic}
          </button>
        </div>
        
        <div className="space-y-4 relative">
          {/* SVG Connection Lines - NEURAL WEB */}
          <div className="absolute left-[34px] top-8 bottom-8 w-px border-l border-dashed border-indigo-500/20 z-0" />

          {tree?.nodes?.map((node, i) => (
            <motion.button
              key={node.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              onClick={() => {
                handleNodeClick(node);
                setShowChat(false);
              }}
              className={`
                w-full p-6 rounded-[2.2rem] border text-left transition-all relative overflow-hidden group z-10
                ${selectedNode?.id === node.id 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_25px_50px_rgba(79,70,229,0.4)] scale-[1.03]' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:scale-[1.01] backdrop-blur-md'}
              `}
            >
              {/* Scanline effect for active node */}
              {selectedNode?.id === node.id && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.3)_50%),_linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%]" />
              )}

              <div className="flex items-center gap-5 relative z-10">
                <div className={`
                  w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500
                  ${selectedNode?.id === node.id ? 'bg-white text-indigo-600 rotate-12' : 'bg-indigo-600/20 text-indigo-400'}
                  shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]
                `}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-sm tracking-tight truncate uppercase italic">{node.label}</span>
                  {node.points && <span className={`text-[9px] font-bold tracking-widest ${selectedNode?.id === node.id ? 'text-white/60' : 'text-indigo-400/60'}`}>+ {node.points} XP NODE</span>}
                </div>
                {selectedNode?.id === node.id && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-auto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
              {node.completed && (
                <div className="absolute top-4 right-4 animate-bounce-subtle">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* XP Particle Explosion Overlay */}
        <AnimatePresence>
          {xpParticles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 2, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              className={`absolute left-1/2 top-1/2 z-[200] pointer-events-none ${p.color}`}
            >
              <Zap className="w-8 h-8 fill-current blur-[0.5px]" />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="h-full bg-black/20 rounded-[3rem] border border-white/5 backdrop-blur-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowChat(false)} 
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl"
                  >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </Button>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">AI ASSISTANT</p>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">{t.askAbout} {selectedNode?.label}</h2>
                  </div>
                </div>
              </div>
              <Chat type="genius" />
            </motion.div>
          ) : selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col space-y-8"
            >
              <Card className="p-12 rounded-[4rem] bg-black/40 border border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-2xl group/main">
                {/* Rainbow Energy Border Animation */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20 blur-2xl group-hover/main:opacity-40 transition-opacity duration-700 animate-gradient-x" />
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                  <Brain className="w-80 h-80" />
                </div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10 space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/30" />
                      <div className="text-[11px] font-black uppercase tracking-[0.6em] text-indigo-500 drop-shadow-sm">{t.nodeExplanation}</div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/30" />
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white italic text-center">
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                      >
                        {selectedNode.label}
                      </motion.span>
                    </h2>
                  </div>
 
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                    <div className="space-y-10">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/20 space-y-6 relative overflow-hidden group shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 text-indigo-400 relative z-10">
                          <Sparkles className="w-6 h-6 animate-pulse" />
                          <span className="text-[11px] font-black uppercase tracking-[0.3em]">{t.theMetaphor}</span>
                        </div>
                        <p className="text-2xl font-bold text-white italic leading-relaxed relative z-10 drop-shadow-md">
                          "{selectedNode.metaphor}"
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">DEEP ANALYSIS</div>
                        <p className="text-gray-400 leading-relaxed text-xl font-medium px-1">
                          {selectedNode.description}
                        </p>
                      </motion.div>
                    </div>
 
                    <div className="space-y-8">
                      <div className="relative group/card">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] blur opacity-10 group-hover/card:opacity-20 transition duration-500" />
                        <div className="p-10 rounded-[3rem] bg-emerald-600/5 border border-emerald-500/20 space-y-8 relative backdrop-blur-xl">
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <div className="flex items-center gap-3">
                              <Target className="w-6 h-6" />
                              <span className="text-[11px] font-black uppercase tracking-[0.3em]">{t.geniusChallenge}</span>
                            </div>
                            {selectedNode.points && (
                              <div className="px-5 py-2 rounded-full bg-emerald-400/10 text-emerald-400 text-[11px] font-black tracking-widest border border-emerald-400/20 shadow-lg shadow-emerald-500/10">
                                {t.rewardLabel} <span className="text-white ml-2">+{selectedNode.points} XP</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-white text-lg font-bold leading-relaxed">
                            {selectedNode.challenge}
                          </p>

                          {!selectedNode.completed && (
                            <div className="space-y-6">
                              <div className="relative">
                                <textarea
                                  value={challengeAnswer}
                                  onChange={(e) => setChallengeAnswer(e.target.value)}
                                  placeholder={t.geniusAnswerPlaceholder}
                                  className="w-full h-32 bg-black/40 border border-white/10 rounded-3xl p-6 text-base text-white placeholder:text-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all custom-scrollbar resize-none font-medium shadow-inner"
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-600 tracking-widest uppercase">
                                  {challengeAnswer.length} chars
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {verifyFeedback && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`p-6 rounded-3xl text-sm font-bold border flex gap-4 ${
                                      verifyFeedback.isCorrect 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    <div className="shrink-0 pt-1">
                                      {verifyFeedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    </div>
                                    <p className="leading-relaxed">{verifyFeedback.text}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <Button 
                                onClick={handleCompleteChallenge}
                                disabled={isVerifying || !challengeAnswer.trim()}
                                className="w-full h-16 gap-3 bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-600/30 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100"
                              >
                                {isVerifying ? (
                                  <><Loader2 className="w-6 h-6 animate-spin" /> {t.verifyingAI}</>
                                ) : (
                                  <><CheckCircle2 className="w-6 h-6" /> {t.submitVerification}</>
                                )}
                              </Button>
                            </div>
                          )}

                          {selectedNode.completed && (
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="p-6 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.2em] shadow-xl"
                            >
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7" />
                              </div>
                              {t.nodeMastered}
                            </motion.div>
                          )}
                        </div>
                      </div>
 
                      <Button 
                        variant="outline" 
                        onClick={() => setShowChat(true)}
                        className="w-full h-20 rounded-[2rem] border-white/10 hover:bg-white/5 gap-4 shadow-xl text-lg font-black uppercase tracking-widest group"
                      >
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" /> {t.askSidekick}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
 
              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 px-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-indigo-500 rounded-full border border-black animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 whitespace-nowrap">{t.architectingMind}</span>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    disabled={!tree?.nodes || tree.nodes.indexOf(selectedNode) === 0}
                    onClick={() => {
                      if (tree?.nodes) {
                        setSelectedNode(tree.nodes[tree.nodes.indexOf(selectedNode) - 1]);
                      }
                    }}
                    className="rounded-2xl px-6 h-12 bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest uppercase border border-white/5"
                  >
                    {t.previous}
                  </Button>
                  <Button 
                    variant="ghost"
                    disabled={!tree?.nodes || tree.nodes.indexOf(selectedNode) === tree.nodes.length - 1}
                    onClick={() => {
                      if (tree?.nodes) {
                        setSelectedNode(tree.nodes[tree.nodes.indexOf(selectedNode) + 1]);
                      }
                    }}
                    className="rounded-2xl px-8 h-12 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[10px] font-black tracking-widest uppercase border border-indigo-500/20 gap-3"
                  >
                    {t.next} <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
