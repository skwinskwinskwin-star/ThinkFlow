
import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Trophy, Clock, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { verifyTask } from '../../services/gemini';

export const Tasks: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<Record<string, { isCorrect: boolean; text: string }>>({});

  useEffect(() => {
    if (!user) return;
    
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Tasks fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const generateTask = async () => {
    if (!user || !profile) return;
    setIsGenerating(true);

    const templates = [
      { title: "Kinetics: Velocity", desc: "Calculate the velocity (v) if an object travels 150 meters (d) in 30 seconds (t). Formula: v = d / t", diff: "Easy", xp: 30 },
      { title: "Chemistry: Symbols", desc: "What is the chemical symbol for the element Gold? (Provide a 2-letter answer)", diff: "Easy", xp: 30 },
      { title: "Algebra: Solve for X", desc: "Solve the linear equation for x: 3x + 12 = 30. Provide only the numeric result.", diff: "Medium", xp: 60 },
      { title: "Physics: Force", desc: "Calculate the net force (F) on a 15kg mass (m) accelerating at 4 m/s² (a). Formula: F = m * a", diff: "Medium", xp: 70 },
      { title: "Logic: Series", desc: "Complete the mathematical sequence: 2, 4, 8, 16, ? What is the next number?", diff: "Medium", xp: 50 },
      { title: "Entropy: Logic", desc: "In a closed system, does entropy tend to increase or decrease? (Answer: Increase or Decrease)", diff: "Challenge", xp: 120 },
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        title: template.title,
        description: template.desc,
        difficulty: template.diff,
        status: 'pending',
        xpReward: template.xp,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Task generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeTask = async (task: Task) => {
    const answer = taskAnswers[task.id];
    if (!user || !profile || task.status === 'completed' || !answer?.trim()) return;

    setVerifyingTaskId(task.id);
    try {
      const result = await verifyTask(task, answer, profile);
      
      setTaskFeedback(prev => ({ 
        ...prev, 
        [task.id]: { isCorrect: result.isCorrect, text: result.feedback } 
      }));

      if (result.isCorrect) {
        const reward = task.xpReward + (result.bonusXP || 0);
        await updateDoc(doc(db, 'tasks', task.id), { status: 'completed' });
        await updateDoc(doc(db, 'users', user.uid), { xp: (profile.xp || 0) + reward });
      }
    } catch (error) {
      console.error("Task completion error:", error);
    } finally {
      setVerifyingTaskId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t.language === 'ru' ? 'Сегодня' : 'Today';
    if (diffDays === 1) return t.language === 'ru' ? 'Вчера' : 'Yesterday';
    
    // If future or long ago, show date but maybe year is weird in this env
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.tasks}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Personalized challenges to grow your logic.
          </p>
        </div>
        <Button 
          onClick={generateTask} 
          disabled={isGenerating}
          className="gap-3 h-16 px-8 rounded-3xl"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Generate New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-30">
            <Zap className="w-20 h-20 mx-auto mb-6" />
            <p className="text-xl font-black uppercase tracking-widest">No tasks yet. Generate one!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <Card 
              key={task.id} 
              hover 
              className={`
                relative overflow-hidden group
                ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`
                  px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                  ${task.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' : 
                    task.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-rose-500/10 text-rose-500'}
                `}>
                  {task.difficulty}
                </div>
                <div className="flex items-center gap-2 text-indigo-500 font-black">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">{task.xpReward} XP</span>
                </div>
              </div>

              <h3 className="text-2xl font-black mb-3 text-[var(--text)] group-hover:text-indigo-500 transition-colors">
                {task.title}
              </h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed mb-6">
                {task.description}
              </p>

              {task.status !== 'completed' && (
                <div className="space-y-4 mb-6">
                  <textarea
                    value={taskAnswers[task.id] || ''}
                    onChange={(e) => setTaskAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                    placeholder="Enter the result, formula, or specific term here..."
                    className="w-full h-20 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-indigo-500/50 transition-colors custom-scrollbar resize-none font-bold"
                  />
                  
                  {taskFeedback[task.id] && (
                    <div className={`p-4 rounded-xl text-xs font-bold border ${taskFeedback[task.id].isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
                      {taskFeedback[task.id].text}
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => completeTask(task)}
                    disabled={verifyingTaskId === task.id || !taskAnswers[task.id]?.trim()}
                    className="w-full h-12 gap-2 rounded-2xl border-indigo-500/20 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                  >
                    {verifyingTaskId === task.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {verifyingTaskId === task.id ? 'VERIFYING...' : 'SUBMIT & VERIFY'}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  {formatDate(task.createdAt)}
                </div>
                
                {task.status === 'completed' && (
                  <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                    <CheckCircle2 className="w-5 h-5" />
                    {t.complete}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
