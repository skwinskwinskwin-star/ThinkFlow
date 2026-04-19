
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

  const addXPAction = async (amount: number) => {
    if (!profile || !user) return;
    const newXP = (profile.xp || 0) + amount;
    
    const newLevel = Math.floor(Math.sqrt(newXP) / 5) + 1;
    
    await updateProfileData({ 
      xp: newXP, 
      level: newLevel > profile.level ? newLevel : profile.level 
    });

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
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#020204] overflow-hidden">
        {/* Floating XP Context */}
        <AnimatePresence>
          {floatingXP.map(xp => (
            <motion.div
              key={xp.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -100 }}
              exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 z-[100] text-emerald-400 font-black text-4xl pointer-events-none drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
            >
              +{xp.amount} XP
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="w-full max-w-4xl space-y-12 relative">
          {/* WOW NEURAL SCAN ANIMATION */}
          <div className="relative flex flex-col items-center">
            {/* Outer Rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                className="absolute border border-indigo-500/20 rounded-full"
                style={{ 
                  width: `${300 + i * 80}px`, 
                  height: `${300 + i * 80}px`,
                  borderStyle: i % 2 === 0 ? 'solid' : 'dashed'
                }}
              />
            ))}

            {/* Pulsing Core */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity }}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 backdrop-blur-3xl flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.3)]"
            >
              <Brain className="w-20 h-20 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
            </motion.div>

            {/* Orbiting Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: 360,
                  x: Math.cos(i * 45) * 150,
                  y: Math.sin(i * 45) * 150
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"
              />
            ))}
          </div>

          <div className="space-y-8 font-mono text-center relative z-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase">Neural Mapping...</h2>
              <p className="text-gray-500 text-xs">SYNTHESIZING SCIENTIFIC NODE: <span className="text-emerald-400">{topic}</span></p>
            </div>
            
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex justify-between text-[10px] text-indigo-400 font-bold">
                <span>INTEL_PROTO_v7.0</span>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  SYSTEM_OPTIMIZING
                </motion.span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 12, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600 animate-pulse rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Cloud Search', status: 'OK' },
                { label: 'Context Logic', status: 'MAP' },
                { label: 'Neural Mix', status: 'RUN' },
                { label: 'Metaphor Sync', status: 'READY' }
              ].map((step, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.5 }}
                  key={idx} 
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md"
                >
                  <div className="text-[9px] text-gray-400 uppercase tracking-tighter mb-1">{step.label}</div>
                  <div className="text-xs font-black text-indigo-400">{step.status}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center pt-20 md:pt-32 pb-12 md:pb-20 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-12 text-center"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-4 h-4" />
                {t.nextGenAI}
              </div>
              {profile?.geniusMode && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  GENIUS MODE ACTIVE
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
              Genius <span className="text-indigo-500">Lab</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto font-medium">
              {t.geniusLabSub}
            </p>
          </div>

          <Card className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl max-w-2xl mx-auto">
                <div className="flex flex-col md:flex-row gap-2">
                  <input 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInitialize()}
                    placeholder={t.masterTopic}
                    className="flex-1 bg-transparent px-8 py-6 outline-none text-xl font-bold text-white placeholder:text-gray-600"
                  />
                  <Button 
                    onClick={handleInitialize}
                    disabled={isLoading || !topic.trim()}
                    className="h-auto py-6 px-10 rounded-[2rem] text-lg gap-3 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {t.constructingKnowledge}
                      </>
                    ) : (
                      <>
                        {t.initialize} [v5.5] <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>

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
                  <p className="text-white text-xl uppercase tracking-tighter font-black">Системный сбой</p>
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
                Попробовать снова
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
      <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{t.knowledgeMap}</h3>
          <button onClick={resetLab} className="text-[10px] font-black uppercase text-indigo-500 hover:underline">{t.newTopic}</button>
        </div>
        
        <div className="space-y-3">
          {tree?.nodes?.map((node, i) => (
            <motion.button
              key={node.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                handleNodeClick(node);
                setShowChat(false);
              }}
              className={`
                w-full p-5 rounded-3xl border text-left transition-all relative overflow-hidden group shadow-lg
                ${selectedNode?.id === node.id 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/30' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'}
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                  ${selectedNode?.id === node.id ? 'bg-white/20 text-white' : 'bg-indigo-600/20 text-indigo-400'}
                `}>
                  {i + 1}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate">{node.label}</span>
                  {node.points && <span className="text-[9px] opacity-60">+{node.points} XP</span>}
                </div>
                {selectedNode?.id === node.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </div>
              {node.completed && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {showChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setShowChat(false)} className="p-2">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{t.askAbout} {selectedNode?.label}</h2>
                </div>
              </div>
              <Chat type="genius" />
            </motion.div>
          ) : selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-8"
            >
              <Card className="p-10 rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Brain className="w-40 h-40" />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">{t.nodeExplanation}</div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">{selectedNode.label}</h2>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <Sparkles className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.theMetaphor}</span>
                        </div>
                        <p className="text-lg font-bold text-white italic leading-relaxed">
                          "{selectedNode.metaphor}"
                        </p>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-lg font-medium">
                        {selectedNode.description}
                      </p>
                    </div>
 
                    <div className="space-y-6">
                      <div className="p-8 rounded-[2.5rem] bg-emerald-600/10 border border-emerald-500/20 space-y-6">
                        <div className="flex items-center justify-between gap-2 text-emerald-400">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t.geniusChallenge}</span>
                          </div>
                          {selectedNode.points && (
                            <div className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-black tracking-widest border border-emerald-400/20">
                              REWARD: +{selectedNode.points} XP
                            </div>
                          )}
                        </div>
                        <p className="text-white font-bold leading-relaxed">
                          {selectedNode.challenge}
                        </p>

                        {!selectedNode.completed && (
                          <div className="space-y-4">
                            <textarea
                              value={challengeAnswer}
                              onChange={(e) => setChallengeAnswer(e.target.value)}
                              placeholder="Enter your final answer here (e.g., '42', 'NaCl', 'F=ma'). Be precise!"
                              className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors custom-scrollbar resize-none font-medium"
                            />
                            
                            {verifyFeedback && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl text-xs font-medium border ${
                                  verifyFeedback.isCorrect 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}
                              >
                                {verifyFeedback.text}
                              </motion.div>
                            )}

                            <Button 
                              onClick={handleCompleteChallenge}
                              disabled={isVerifying || !challengeAnswer.trim()}
                              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                              {isVerifying ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> VERIFYING BY AI...</>
                              ) : (
                                <><CheckCircle2 className="w-5 h-5" /> SUBMIT FOR VERIFICATION</>
                              )}
                            </Button>
                          </div>
                        )}

                        {selectedNode.completed && (
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                            <CheckCircle2 className="w-5 h-5" /> NODE MASTERED
                          </div>
                        )}
                      </div>
 
                      <Button 
                        variant="outline" 
                        onClick={() => setShowChat(true)}
                        className="w-full h-16 rounded-2xl border-white/10 hover:bg-white/5 gap-3"
                      >
                        <MessageSquare className="w-5 h-5" /> {t.askSidekick}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
 
              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t.architectingMind}</span>
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
                    className="gap-2"
                  >
                    {t.next} <ArrowRight className="w-4 h-4" />
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
