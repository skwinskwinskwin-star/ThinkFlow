
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AIModelType, Message, Attachment, ChatSession } from '../../types';
import { askThinkFlowAI } from '../../services/gemini';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface ChatProps {
  type: AIModelType;
  sessionId?: string;
}

export const Chat: React.FC<ChatProps> = ({ type, sessionId: initialSessionId }) => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user || !sessionId) return;

    const q = doc(db, 'sessions', sessionId);
    const unsubscribe = onSnapshot(q, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ChatSession;
        setMessages(data.messages);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `sessions/${sessionId}`);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = (evt.target?.result as string).split(',')[1];
      setAttachment({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !attachment) || !user || !profile || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachment: attachment || undefined
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const aiResponse = await askThinkFlowAI(type, input, profile, messages, attachment || undefined);
      const modelMsg: Message = {
        role: 'model',
        text: aiResponse,
        timestamp: Date.now()
      };

      const finalMessages = [...newMessages, modelMsg];
      
      if (!sessionId) {
        const sessionData = {
          userId: user.uid,
          title: input.slice(0, 30) || "New Conversation",
          type,
          messages: finalMessages,
          lastUpdated: Date.now()
        };
        const docRef = await addDoc(collection(db, 'sessions'), sessionData);
        setSessionId(docRef.id);
      } else {
        await updateDoc(doc(db, 'sessions', sessionId), {
          messages: finalMessages,
          lastUpdated: Date.now()
        });
      }

      // Update XP
      await updateDoc(doc(db, 'users', user.uid), {
        xp: (profile.xp || 0) + 15
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto w-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-6 px-4">
            <div className="w-32 h-32 bg-indigo-600/10 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner">
              {type === 'teacher' ? '🎓' : type === 'coach' ? '🧠' : '⚡'}
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--text)]">
                ThinkFlow {type}
              </h3>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed text-[var(--muted)]">
                {type === 'teacher' ? t.feat1 : type === 'coach' ? t.feat2 : t.feat3}
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`
                flex gap-4 max-w-[85%] 
                ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
              `}>
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[var(--input)] text-[var(--text)]'}
                `}>
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`
                  p-6 rounded-[2rem] shadow-xl
                  ${m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-[var(--card)] border border-[var(--border)] rounded-tl-none text-[var(--text)]'}
                `}>
                  {m.attachment && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                      <img 
                        src={`data:${m.attachment.mimeType};base64,${m.attachment.data}`} 
                        className="max-h-60 rounded-xl w-full object-cover" 
                        alt="Attachment" 
                      />
                    </div>
                  )}
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-[var(--input)] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2rem] rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 md:p-10 border-t border-[var(--border)] bg-[var(--bg)]/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-end gap-4 md:gap-6">
          <div className="flex-1 relative">
            {attachment && (
              <div className="absolute -top-14 left-0 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase animate-in slide-in-from-bottom-2 shadow-lg">
                <span className="truncate max-w-[150px]">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="ml-2 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <textarea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }} 
              placeholder="Type your thought and wait for AI..." 
              className={`
                w-full bg-[var(--input)] border border-[var(--border)] 
                rounded-[2rem] p-5 pr-16 outline-none focus:border-indigo-500 transition-all 
                resize-none h-16 md:h-20 text-[var(--text)] text-sm font-medium
              `} 
            />
            <label className="absolute right-5 bottom-5 cursor-pointer text-slate-500 hover:text-indigo-500 transition-colors">
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="image/*" 
              />
              <Paperclip className="w-6 h-6" />
            </label>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={(!input.trim() && !attachment) || isLoading}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0 shrink-0"
          >
            <Send className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};
