
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Loader2, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserProfile } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { Card } from '../UI/Card';
import { motion } from 'framer-motion';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('xp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as UserProfile));
      
      // If there's only one user (the current one), we can show some placeholders 
      // or just ensure the layout is robust for single-player mode.
      setStudents(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard fetch error:", error);
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

  const topThree = students.slice(0, 3);
  const remaining = students.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-7xl font-black uppercase tracking-tighter text-[var(--text)] italic">
          {t.leaderboard}
        </h2>
        <p className="text-indigo-500 font-black tracking-[0.3em] uppercase text-xs">
          The Hall of Fame for Global Thinkers
        </p>
      </div>

      {/* Podium Section */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10">
          {[1, 0, 2].map((podiumIndex) => {
            const student = topThree[podiumIndex];
            if (!student) return <div key={`empty-${podiumIndex}`} className="hidden md:block" />;
            
            const isMe = student.uid === user?.uid;
            const rank = podiumIndex + 1;
            const isFirst = rank === 1;

            return (
              <motion.div
                key={student.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`
                  relative flex flex-col items-center p-8 rounded-[3.5rem] border transition-all
                  ${isFirst ? 'md:order-2 md:-translate-y-10 bg-indigo-600 text-white border-indigo-400 shadow-[0_20px_50px_rgba(79,70,229,0.4)]' : 'md:order-1 bg-[var(--card)] border-[var(--border)]'}
                  ${rank === 2 ? 'md:order-1' : rank === 3 ? 'md:order-3' : ''}
                `}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  {rank === 1 ? <Crown className="w-12 h-12 text-yellow-400 drop-shadow-xl" /> :
                   rank === 2 ? <Medal className="w-10 h-10 text-slate-300" /> :
                   <Medal className="w-10 h-10 text-amber-600" />}
                </div>

                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-indigo-500/20 mb-6 overflow-hidden border-4 border-indigo-500/30 flex items-center justify-center text-3xl font-black">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name?.[0] || 'U'
                  )}
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight text-center truncate w-full">
                  {student.name}
                </h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isFirst ? 'text-indigo-200' : 'text-[var(--muted)]'}`}>
                  LVL {student.level} • {student.studentClass}
                </p>
                
                <div className={`px-6 py-2 rounded-2xl font-black text-xl flex items-center gap-2 ${isFirst ? 'bg-white text-indigo-600' : 'bg-indigo-600/10 text-indigo-500'}`}>
                  <Zap className="w-5 h-5 fill-current" />
                  {student.xp.toLocaleString()}
                </div>

                {isMe && (
                  <div className="mt-4 px-3 py-1 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                    Это вы
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List Section */}
      {remaining.length > 0 && (
        <div className="space-y-4">
          {remaining.map((student, index) => {
            const isMe = student.uid === user?.uid;
            const absoluteRank = index + 4;

            return (
              <Card 
                key={student.uid} 
                className={`
                  flex items-center justify-between p-6 md:p-8 rounded-[2.5rem] transition-all group
                  ${isMe ? 'bg-indigo-600/10 border-indigo-500/30' : 'hover:border-indigo-500/20'}
                `}
              >
                <div className="flex items-center gap-6 md:gap-10">
                  <span className="w-10 text-2xl font-black text-[var(--muted)] group-hover:text-indigo-500 transition-colors">
                    # {absoluteRank}
                  </span>

                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-xl font-black text-indigo-500 overflow-hidden shadow-sm">
                    {student.photoURL ? (
                      <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      student.name?.[0] || 'U'
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text)]">
                      {student.name} {isMe && <span className="ml-2 text-[8px] align-middle bg-indigo-500 text-white px-2 py-0.5 rounded-full">YOU</span>}
                    </h3>
                    <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest mt-1">
                      LVL {student.level} • {student.studentClass}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-500 font-mono tracking-tighter">
                    {student.xp.toLocaleString()} XP
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {students.length === 0 && (
        <div className="py-20 text-center opacity-30">
          <Trophy className="w-20 h-20 mx-auto mb-6" />
          <p className="text-xl font-black uppercase tracking-[0.2em]">Пока никого нет...</p>
        </div>
      )}
    </div>
  );
};
