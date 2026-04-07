
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, MessageSquare, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, Review } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

export const Admin: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
    });

    const reviewsRef = collection(db, 'reviews');
    const qReviews = query(reviewsRef, orderBy('timestamp', 'desc'));
    const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setReviews(reviewsData);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeReviews();
    };
  }, [profile]);

  const deleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const toggleAdmin = async (uid: string, currentRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { 
        role: currentRole === 'admin' ? 'student' : 'admin' 
      });
    } catch (error) {
      console.error("Toggle admin error:", error);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text)]">Access Denied</h2>
        <p className="text-[var(--muted)] mt-2">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            Admin Panel
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            System management and oversight.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-[var(--input)] text-[var(--muted)]'}`}
          >
            Users ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-indigo-600 text-white' : 'bg-[var(--input)] text-[var(--muted)]'}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
      ) : activeTab === 'users' ? (
        <div className="grid grid-cols-1 gap-4">
          {users.map(u => (
            <Card key={u.uid} className="p-6 rounded-3xl border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--input)] rounded-xl flex items-center justify-center font-black text-indigo-500">
                  {u.name[0]}
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm text-[var(--text)]">{u.name}</h4>
                  <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">{u.email} • {u.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-xs font-black text-[var(--text)]">{u.xp} XP</p>
                  <p className="text-[9px] font-black uppercase text-[var(--muted)]">Level {u.level}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleAdmin(u.uid, u.role)}
                  className={`rounded-xl h-10 px-4 text-[10px] ${u.role === 'admin' ? 'border-rose-500 text-rose-500' : 'border-indigo-500 text-indigo-500'}`}
                >
                  {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map(r => (
            <Card key={r.id} className="p-6 rounded-3xl border border-[var(--border)] flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black uppercase text-xs text-[var(--text)]">{r.userName}</span>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: r.rating }).map((_, i) => <CheckCircle key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                </div>
                <p className="text-sm text-[var(--muted)] italic">"{r.text}"</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteReview(r.id!)}
                className="rounded-xl h-10 w-10 p-0 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
