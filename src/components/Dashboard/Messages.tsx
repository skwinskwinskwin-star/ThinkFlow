
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  MoreHorizontal, 
  ArrowLeft,
  Loader2,
  User,
  Plus,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChatThread, DirectMessage, UserProfile } from '../../types';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { motion, AnimatePresence } from 'framer-motion';

export const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.uid),
      orderBy('lastTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatThread));
      setThreads(threadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedThread) return;

    const q = query(
      collection(db, 'chats', selectedThread.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
      setMessages(messagesData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile))
        .filter(u => u.uid !== user?.uid);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const startNewChat = async (targetUser: UserProfile) => {
    if (!user || !profile) return;
    
    // Check if thread exists
    const threadId = [user.uid, targetUser.uid].sort().join('_');
    const threadRef = doc(db, 'chats', threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) {
      const newThread: Partial<ChatThread> = {
        participants: [user.uid, targetUser.uid],
        participantNames: {
          [user.uid]: profile.name,
          [targetUser.uid]: targetUser.name
        },
        participantPhotos: {
          [user.uid]: profile.photoURL || null,
          [targetUser.uid]: targetUser.photoURL || null
        },
        lastMessage: 'Начат новый разговор',
        lastTimestamp: Date.now()
      };
      await setDoc(threadRef, newThread);
      setSelectedThread({ id: threadId, ...newThread } as ChatThread);
    } else {
      // Update photos if they exist but might be outdated
      const existingData = threadSnap.data() as ChatThread;
      const updatedPhotos = {
        ...existingData.participantPhotos,
        [user.uid]: profile.photoURL || null,
        [targetUser.uid]: targetUser.photoURL || null
      };
      await updateDoc(threadRef, { participantPhotos: updatedPhotos });
      setSelectedThread({ id: threadId, ...existingData, participantPhotos: updatedPhotos } as ChatThread);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return;
    const text = newMessage;
    setNewMessage('');
    try {
      await addDoc(collection(db, 'chats', selectedThread.id, 'messages'), {
        chatId: selectedThread.id,
        senderId: user.uid,
        text,
        timestamp: Date.now()
      });
      await updateDoc(doc(db, 'chats', selectedThread.id), {
        lastMessage: text,
        lastTimestamp: Date.now()
      });
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  const getOtherParticipantName = (thread: ChatThread) => {
    const otherId = thread.participants.find(id => id !== user?.uid);
    return otherId ? thread.participantNames[otherId] : 'User';
  };

  const getOtherParticipantPhoto = (thread: ChatThread) => {
    const otherId = thread.participants.find(id => id !== user?.uid);
    return otherId ? thread.participantPhotos?.[otherId] : null;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in duration-700">
      {/* Sidebar Threads List */}
      <div className={`
        flex-col w-full md:w-80 bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden flex
        ${selectedThread ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-6 border-b border-[var(--border)] space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--text)]">Чаты</h2>
          <div className="relative">
            <input 
              type="text"
              placeholder="Поиск собеседника..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-[var(--text)] focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute left-6 right-6 top-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {searchResults.map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => startNewChat(u)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-[var(--input)] transition-all border-b border-[var(--border)] last:border-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black overflow-hidden bg-indigo-600 shadow-lg shadow-indigo-500/10">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name[0]
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xs text-[var(--text)]">{u.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black">{u.studentClass}</p>
                    </div>
                    <Plus className="w-4 h-4 ml-auto text-indigo-500" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className={`
                w-full p-4 rounded-[1.5rem] flex items-center gap-3 transition-all
                ${selectedThread?.id === thread.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'hover:bg-[var(--input)] text-[var(--text)]'}
              `}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black overflow-hidden shadow-lg shadow-indigo-500/10 ${selectedThread?.id === thread.id ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'}`}>
                {getOtherParticipantPhoto(thread) ? (
                  <img src={getOtherParticipantPhoto(thread)!} alt={getOtherParticipantName(thread)} className="w-full h-full object-cover" />
                ) : (
                  getOtherParticipantName(thread)[0]
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-black text-sm truncate">{getOtherParticipantName(thread)}</p>
                <p className={`text-[10px] truncate ${selectedThread?.id === thread.id ? 'text-white/60' : 'text-gray-500'} font-bold`}>
                  {thread.lastMessage}
                </p>
              </div>
            </button>
          ))}
          {threads.length === 0 && (
            <div className="p-10 text-center opacity-30">
              <User className="w-12 h-12 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Нет активных чатов</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden flex flex-col relative
        ${!selectedThread ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center gap-4">
              <button 
                onClick={() => setSelectedThread(null)}
                className="md:hidden text-gray-500"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-indigo-500/10">
                {getOtherParticipantPhoto(selectedThread) ? (
                  <img src={getOtherParticipantPhoto(selectedThread)!} alt={getOtherParticipantName(selectedThread)} className="w-full h-full object-cover" />
                ) : (
                  getOtherParticipantName(selectedThread)[0]
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[var(--text)]">{getOtherParticipantName(selectedThread)}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">В сети</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] md:max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed
                    ${msg.senderId === user?.uid 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                      : 'bg-[var(--input)] text-[var(--text)] rounded-tl-none border border-[var(--border)]'}
                  `}>
                    {msg.text}
                    <div className={`text-[8px] mt-1 font-black uppercase tracking-widest ${msg.senderId === user?.uid ? 'text-white/50' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg)]/50 backdrop-blur-md">
              <div className="flex gap-4">
                <input 
                  type="text"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text)] focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 p-0 shadow-lg shadow-indigo-500/30 group"
                >
                  <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-[3rem] flex items-center justify-center text-indigo-500 mb-8">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--text)] mb-2">Ваши сообщения</h3>
            <p className="max-w-xs text-sm font-medium">Выберите чат из списка или найдите пользователя по имени, чтобы начать общение.</p>
          </div>
        )}
      </div>
    </div>
  );
};
