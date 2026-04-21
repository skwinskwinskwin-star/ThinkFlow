
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon,
  User,
  Loader2,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Post, Comment } from '../../types';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove,
  limit
} from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { motion, AnimatePresence } from 'framer-motion';

export const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!user || !profile || !newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photoURL || null,
        content: newPostContent,
        likes: [],
        commentsCount: 0,
        createdAt: Date.now()
      });
      setNewPostContent('');
    } catch (error) {
      console.error("Post creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    const isLiked = post.likes.includes(user.uid);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const loadComments = (postId: string) => {
    if (activePostId === postId) {
      setActivePostId(null);
      return;
    }
    setActivePostId(postId);
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !profile || !newComment.trim()) return;
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        postId,
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photoURL || null,
        content: newComment,
        createdAt: Date.now()
      });
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: (posts.find(p => p.id === postId)?.commentsCount || 0) + 1
      });
      setNewComment('');
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error("Delete error:", error);
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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
          {t.community}
        </h2>
        <p className="text-[var(--muted)] font-medium">
          Общайтесь, делитесь идеями и развивайтесь вместе.
        </p>
      </div>

      {/* Create Post */}
      <Card className="p-6 md:p-8 rounded-[2.5rem] border border border-[var(--border)] bg-[var(--card)] shadow-xl relative overflow-hidden group">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black flex-shrink-0 overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile?.name?.[0] || 'U'
            )}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="О чем вы думаете?"
              className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl text-[var(--text)] placeholder:text-[var(--muted)] resize-none custom-scrollbar min-h-[100px]"
            />
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-gray-500">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Фото</span>
                </Button>
              </div>
              <Button 
                onClick={handleCreatePost} 
                disabled={isSubmitting || !newPostContent.trim()}
                className="rounded-2xl px-8 h-12 bg-indigo-600 hover:bg-indigo-500 gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="font-black uppercase text-[10px] tracking-widest underline decoration-2 underline-offset-4">Опубликовать</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className="p-6 md:p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-indigo-500/20 transition-all group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 font-black overflow-hidden bg-indigo-600 shadow-lg shadow-indigo-500/10">
                    {post.userPhoto ? (
                      <img src={post.userPhoto} alt={post.userName} className="w-full h-full object-cover" />
                    ) : (
                      post.userName?.[0] || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-[var(--text)] tracking-tight">{post.userName}</h4>
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {user?.uid === post.userId && (
                  <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="text-lg md:text-xl text-[var(--text)] leading-relaxed mb-8 whitespace-pre-wrap">
                {post.content}
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-[var(--border)]">
                <button 
                  onClick={() => toggleLike(post)}
                  className={`flex items-center gap-2 group transition-colors ${post.likes.includes(user?.uid || '') ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
                >
                  <Heart className={`w-5 h-5 ${post.likes.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                  <span className="text-sm font-black">{post.likes.length}</span>
                </button>

                <button 
                  onClick={() => loadComments(post.id)}
                  className={`flex items-center gap-2 text-gray-500 hover:text-indigo-500 transition-colors ${activePostId === post.id ? 'text-indigo-500' : ''}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-black">{post.commentsCount}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-500 transition-colors ml-auto">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {activePostId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 space-y-6 pt-6 border-t border-[var(--border)]">
                      <div className="space-y-4">
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 overflow-hidden shadow-lg shadow-indigo-500/10">
                              {comment.userPhoto ? (
                                <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                              ) : (
                                comment.userName?.[0] || 'U'
                              )}
                            </div>
                            <div className="flex-1 bg-[var(--input)] p-4 rounded-2xl rounded-tl-none">
                              <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">{comment.userName}</p>
                              <p className="text-sm text-[var(--text)]">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <textarea
                          placeholder="Напишите комментарий..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 text-sm text-[var(--text)] focus:outline-none focus:border-indigo-500/50 resize-none h-12 leading-tight"
                        />
                        <Button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment.trim()}
                          className="w-12 h-12 rounded-2xl bg-indigo-600 p-0 flex items-center justify-center"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
