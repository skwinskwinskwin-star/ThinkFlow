
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserProfile } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card } from '../UI/Card';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as UserProfile);
      setStudents(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black uppercase tracking-tighter text-[var(--text)]">
          {t.leaderboard}
        </h2>
        <p className="text-[var(--muted)] font-medium tracking-widest uppercase text-[10px]">
          The Hall of Fame for Global Thinkers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {students.map((student, index) => {
          const isMe = student.uid === user?.uid;
          const isTop3 = index < 3;

          return (
            <Card 
              key={student.uid} 
              className={`
                flex items-center justify-between p-8 md:p-10 rounded-[3rem] transition-all
                ${isMe ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : ''}
                ${isTop3 ? 'scale-[1.02] shadow-xl' : ''}
              `}
            >
              <div className="flex items-center gap-6 md:gap-10">
                <div className="w-12 text-center">
                  {index === 0 ? <Crown className="w-8 h-8 text-yellow-500 mx-auto" /> :
                   index === 1 ? <Medal className="w-8 h-8 text-slate-400 mx-auto" /> :
                   index === 2 ? <Medal className="w-8 h-8 text-amber-600 mx-auto" /> :
                   <span className="text-3xl font-black opacity-20 text-[var(--text)]">{index + 1}</span>}
                </div>

                <div className="relative">
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white shadow-2xl
                    ${isTop3 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-[var(--muted)]'}
                  `}>
                    {student.name?.[0] || 'U'}
                  </div>
                  {isMe && (
                    <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      You
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[var(--text)]">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">
                      LVL {student.level}
                    </span>
                    <span className="w-1 h-1 bg-[var(--border)] rounded-full" />
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                      {student.studentClass}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl md:text-4xl font-black text-indigo-500 font-mono tracking-tighter">
                  {student.xp.toLocaleString()}
                </p>
                <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest mt-1">
                  Total XP
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
