
import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Circle, Trophy, Clock, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

export const Tasks: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const generateTask = async () => {
    if (!user || !profile) return;
    setIsGenerating(true);

    // In a real app, this would call Gemini to generate a personalized task
    // For now, we'll simulate it with a few templates
    const templates = [
      { title: "Explain Momentum", desc: "Explain how momentum works in football using metaphors.", diff: "Medium", xp: 50 },
      { title: "Solve for X", desc: "Create a real-world scenario where you need to solve an algebraic equation.", diff: "Easy", xp: 30 },
      { title: "Socratic Logic", desc: "Identify a logical fallacy in a common argument about climate change.", diff: "Challenge", xp: 100 },
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
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const completeTask = async (task: Task) => {
    if (!user || !profile || task.status === 'completed') return;

    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'completed'
      });

      await updateDoc(doc(db, 'users', user.uid), {
        xp: (profile.xp || 0) + task.xpReward
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
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
              <p className="text-[var(--muted)] text-sm leading-relaxed mb-8">
                {task.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
                
                {task.status === 'completed' ? (
                  <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                    <CheckCircle2 className="w-5 h-5" />
                    {t.complete}
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => completeTask(task)}
                    className="gap-2 rounded-xl"
                  >
                    <Circle className="w-4 h-4" />
                    Mark Done
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
