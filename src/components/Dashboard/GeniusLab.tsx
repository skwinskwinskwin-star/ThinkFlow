
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Target, Zap, ArrowRight, Loader2, CheckCircle2, ChevronRight, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { generateKnowledgeTree, cachedKey } from '../../services/gemini';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KnowledgeTree, KnowledgeNode } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Chat } from './Chat';

export const GeniusLab: React.FC = () => {
  const { profile } = useAuth();
  const { language, t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [tree, setTree] = useState<KnowledgeTree | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleInitialize = async () => {
    if (!topic.trim() || !profile) return;
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    try {
      const generatedTree = await generateKnowledgeTree(topic, profile);
      setTree(generatedTree);
      setSelectedNode(generatedTree.nodes[0]);
    } catch (err) {
      console.error("Genius Lab Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to initialize lab";
      setError(msg);
      
      if (msg.includes("API Key")) {
        try {
          const resp = await fetch('/api/debug');
          const data = await resp.json();
          setDebugInfo(data);
        } catch (e) {
          console.error("Failed to fetch debug info");
        }
      }
    } finally {
      setIsLoading(false);
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
      <div className="h-full flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 border-4 border-dashed border-indigo-500/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-48 h-48 border-2 border-dashed border-emerald-500/20 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-16 h-16 text-indigo-500" />
            </motion.div>
          </div>
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
            {t.constructingKnowledge || "Architecting Mind"}
          </h3>
          <div className="space-y-2">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse">
              Internet Research & Neural Mapping: {topic}
            </p>
          </div>
          <p className="text-xs text-gray-500 font-medium italic">
            "The AI is currently studying the latest information on the internet and synthesizing metaphors from your interests..."
          </p>
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
              {!cachedKey && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                  <Brain className="w-4 h-4" />
                  HEURISTIC ENGINE ACTIVE (OFFLINE AI)
                </div>
              )}
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
                        {t.initialize} <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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
    <div className="h-full flex flex-col lg:flex-row gap-8 p-4 md:p-8">
      {/* Knowledge Map Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{t.knowledgeMap}</h3>
          <button onClick={resetLab} className="text-[10px] font-black uppercase text-indigo-500 hover:underline">{t.newTopic}</button>
        </div>
        
        <div className="space-y-3">
          {tree.nodes.map((node, i) => (
            <motion.button
              key={node.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                setSelectedNode(node);
                setShowChat(false);
              }}
              className={`
                w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden group
                ${selectedNode?.id === node.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                  ${selectedNode?.id === node.id ? 'bg-white/20 text-white' : 'bg-indigo-600/20 text-indigo-400'}
                `}>
                  {i + 1}
                </div>
                <span className="font-bold text-sm truncate">{node.label}</span>
                {selectedNode?.id === node.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </div>
              {node.type === 'core' && (
                <div className="absolute top-0 right-0 p-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current opacity-50" />
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
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Target className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.geniusChallenge}</span>
                        </div>
                        <p className="text-white font-bold leading-relaxed">
                          {selectedNode.challenge}
                        </p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 gap-2">
                          <CheckCircle2 className="w-5 h-5" /> {t.completeChallenge}
                        </Button>
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
                    disabled={tree.nodes.indexOf(selectedNode) === 0}
                    onClick={() => setSelectedNode(tree.nodes[tree.nodes.indexOf(selectedNode) - 1])}
                  >
                    {t.previous}
                  </Button>
                  <Button 
                    variant="ghost"
                    disabled={tree.nodes.indexOf(selectedNode) === tree.nodes.length - 1}
                    onClick={() => setSelectedNode(tree.nodes[tree.nodes.indexOf(selectedNode) + 1])}
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
