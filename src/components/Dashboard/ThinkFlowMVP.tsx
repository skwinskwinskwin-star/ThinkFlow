
import React, { useState } from 'react';
import { Brain, Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getPersonalizedExplanation } from '../../services/gemini';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

export const ThinkFlowMVP: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [interests, setInterests] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || !interests.trim()) return;
    
    setIsLoading(true);
    setExplanation('');
    
    try {
      const interestsArray = interests.split(',').map(i => i.trim());
      const result = await getPersonalizedExplanation(topic, interestsArray);
      setExplanation(result);
    } catch (error) {
      setExplanation("Error: Failed to connect to AI. Check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-xl">
          <Brain className="w-10 h-10" />
        </div>
        <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
          ThinkFlow <span className="text-indigo-600">MVP</span>
        </h2>
        <p className="text-[var(--muted)] font-medium max-w-md mx-auto">
          The core engine: Explain any topic through the lens of your personal interests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 rounded-[3rem] border border-[var(--border)] space-y-8 bg-[var(--card)] shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-2">Topic to Learn</label>
              <input 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Newton's Laws"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all text-[var(--text)] font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-2">Your Interests (comma separated)</label>
              <input 
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="e.g. football, gaming, anime"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all text-[var(--text)] font-bold"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !topic || !interests}
              className="w-full h-16 rounded-2xl text-lg gap-3 shadow-xl shadow-indigo-500/20"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              Generate Explanation
            </Button>
          </div>
        </Card>

        <Card className="p-8 rounded-[3rem] border border-[var(--border)] bg-[var(--input)] min-h-[400px] relative overflow-hidden">
          {!explanation && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
              <Send className="w-12 h-12" />
              <p className="text-xs font-black uppercase tracking-widest">Waiting for input...</p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white animate-pulse">
                <Brain className="w-8 h-8" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-500 animate-pulse">AI is thinking...</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
