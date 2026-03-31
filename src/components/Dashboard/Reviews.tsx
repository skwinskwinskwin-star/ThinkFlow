
import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Send, Loader2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Review } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

export const Reviews: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewInput, setReviewInput] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const submitReview = async () => {
    if (!user || !profile || !reviewInput.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: profile.name,
        text: reviewInput,
        rating,
        timestamp: Date.now()
      });
      setReviewInput('');
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Stars = ({ rating, interactive = false, onSelect }: { rating: number, interactive?: boolean, onSelect?: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button 
          key={s} 
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(s)}
          className={`
            transition-all duration-300
            ${s <= rating ? "text-yellow-500" : "text-[var(--border)]"}
            ${interactive ? "hover:scale-125 cursor-pointer" : ""}
          `}
        >
          <Star className={`w-5 h-5 ${s <= rating ? "fill-yellow-500" : ""}`} />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.reviews}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            Hear from our global community of thinkers.
          </p>
        </div>
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <MessageCircle className="w-10 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <MessageCircle className="w-20 h-20 mx-auto mb-6" />
              <p className="text-xl font-black uppercase tracking-widest">No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} hover className="p-8 rounded-[3rem] border border-[var(--border)]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                      {review.userName[0]}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">{review.userName}</h4>
                      <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                <p className="text-[var(--muted)] leading-relaxed italic">
                  "{review.text}"
                </p>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-10 rounded-[3.5rem] border border-[var(--border)] sticky top-24">
            <h3 className="text-2xl font-black mb-8 text-[var(--text)] uppercase tracking-tighter">Share Your Story</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Your Rating</label>
                <Stars rating={rating} interactive onSelect={setRating} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">Your Experience</label>
                <textarea 
                  value={reviewInput} 
                  onChange={e => setReviewInput(e.target.value)} 
                  placeholder={t.writeReview} 
                  className={`
                    w-full bg-[var(--input)] border border-[var(--border)] 
                    rounded-2xl p-5 text-sm outline-none focus:border-indigo-500 transition-all h-40 resize-none text-[var(--text)]
                  `} 
                />
              </div>
              <Button 
                onClick={submitReview} 
                disabled={!reviewInput.trim() || isSubmitting}
                className="w-full h-16 rounded-2xl gap-3"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {t.submit}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
