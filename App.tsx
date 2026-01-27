
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, Language, StudentClass, Message, ChatSession, Review, Article, AIModelType } from './types';
import { askThinkFlowAI } from './services/geminiService';

const INTERESTS = ['Sports', 'Football', 'Chess', 'Anime', 'Music', 'Design', 'Coding', 'Cooking', 'Cars', 'Business', 'Gaming', 'Movies', 'Art', 'Fitness', 'Science'];
const CLASSES: StudentClass[] = ['7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B'];

const ADMIN_EMAIL = 'skwinskwinskwin@gmail.com';
const ADMIN_PASS = 'sarvar1212333323211112123333232111';

const INITIAL_ARTICLES: Article[] = [
  { id: 'p1', subject: 'Physics', title: 'Momentum in Sports', content: 'Physics isn\'t just in books. When a player kicks a ball, the conservation of momentum is what makes it soar...', author: 'Dr. Newton', icon: '⚛️' },
  { id: 'a1', subject: 'Algebra', title: 'The Algorithm of Life', content: 'Variables are empty slots waiting for purpose. Solving for X is solving for the unknown in your future...', author: 'Al-Khwarizmi', icon: '📐' },
  { id: 'e1', subject: 'English', title: 'Persuasive Flows', content: 'In English, flow is everything. It’s not about words, it’s about the rhythm of logic...', author: 'Shakespeare', icon: '✍️' }
];

const INITIAL_REVIEWS: Review[] = [
  { id: '1', userName: 'Alex K.', text: 'This changed how I view Algebra. Metaphors really work!', rating: 5, timestamp: Date.now() - 1000000 },
  { id: '2', userName: 'Mariya S.', text: 'The Socratic coach is tough but amazing for my logic.', rating: 4, timestamp: Date.now() - 500000 }
];

const TRANSLATIONS = {
  en: {
    hero: "Think Better, Not Faster.",
    sub: "ThinkFlow is a global EdTech platform that switches your brain from memorizing to understanding.",
    features: "What's Inside?",
    feat1: "Concept Teacher: Learns your interests and explains topics through them.",
    feat2: "Thinking Coach: Uses Socratic method—asks questions instead of giving answers.",
    feat3: "Adaptive Trainer: Personalized challenges that grow with your logic.",
    start: "Get Started", login: "Login", logout: "Logout",
    dash: "Dashboard", teacher: "Concept Teacher", coach: "Thinking Coach", trainer: "Adaptive Trainer",
    wall: "Hall of Fame", profile: "Profile", admin: "System Admin",
    save: "Apply Changes", reviews: "Community Reviews", history: "Recent Sessions",
    authError: "Access Denied. Check your credentials.",
    writeReview: "Share your experience", submit: "Post",
    theme: "Toggle Theme",
    editProfile: "Edit Profile",
    name: "Full Name",
    bio: "Bio",
    update: "Update Profile"
  },
  ru: {
    hero: "Думай лучше, а не быстрее.",
    sub: "ThinkFlow — это глобальная EdTech платформа, которая переключает ваш мозг с запоминания на понимание.",
    features: "Что внутри?",
    feat1: "Учитель Концептов: Объясняет темы через твои интересы (футбол, аниме, код).",
    feat2: "Коуч Мышления: Сократовский метод — учит тебя находить ответы самому.",
    feat3: "Адаптивный Тренер: Задачи, которые подстраиваются под твой уровень логики.",
    start: "Начать", login: "Войти", logout: "Выйти",
    dash: "Главная", teacher: "Учитель концептов", coach: "Коуч мышления", trainer: "Адаптивный тренер",
    wall: "Зал славы", profile: "Профиль", admin: "Админ-панель",
    save: "Сохранить", reviews: "Отзывы сообщества", history: "История сессий",
    authError: "Доступ запрещен. Проверьте данные.",
    writeReview: "Поделитесь опытом", submit: "Опубликовать",
    theme: "Сменить тему",
    editProfile: "Редактор профиля",
    name: "ФИО",
    bio: "О себе",
    update: "Обновить профиль"
  },
  uz: {
    hero: "Yaxshiroq o'ylang, tezroq emas.",
    sub: "ThinkFlow — bu sizning miyangizni yodlashdan tushunishga o'tkazadigan global EdTech platformasi.",
    features: "Ichida nima bor?",
    feat1: "Konsept Ustoz: Mavzularni sizning qiziqishlaringiz orqali tushuntiradi.",
    feat2: "Fikrlash Murabbiyi: Savollar orqali yechimni o'zingiz topishingizga yordam beradi.",
    feat3: "Moslashuvchan Trener: Sizning darajangizga mos vazifalar generatori.",
    start: "Boshlash", login: "Kirish", logout: "Chiqish",
    dash: "Asosiy", teacher: "Konsept Ustoz", coach: "Fikrlash Murabbiyi", trainer: "Trener",
    wall: "Reyting", profile: "Profil", admin: "Admin Paneli",
    save: "Saqlash", reviews: "Sharhlar", history: "Tarix",
    authError: "Xatolik. Ma'lumotlarni tekshiring.",
    writeReview: "Fikringizni yozing", submit: "Yuborish",
    theme: "Mavzu o'zgartirish",
    editProfile: "Profilni tahrirlash",
    name: "Ism sharif",
    bio: "Ma'lumot",
    update: "Yangilash"
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('ru');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dash' | 'chat' | 'wall' | 'profile' | 'admin'>('landing');
  const [activeAI, setActiveAI] = useState<AIModelType>('teacher');
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [reviewInput, setReviewInput] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('tf_user');
    const savedStudents = localStorage.getItem('tf_students');
    const savedReviews = localStorage.getItem('tf_reviews');
    const savedSessions = localStorage.getItem('tf_sessions');
    const savedTheme = localStorage.getItem('tf_theme') as 'dark' | 'light';
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('tf_user', JSON.stringify(user));
    localStorage.setItem('tf_students', JSON.stringify(students));
    localStorage.setItem('tf_reviews', JSON.stringify(reviews));
    localStorage.setItem('tf_sessions', JSON.stringify(sessions));
    localStorage.setItem('tf_theme', theme);
  }, [user, students, reviews, theme, sessions]);

  const t = TRANSLATIONS[lang];

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') as string).toLowerCase().trim();
    const pass = fd.get('password') as string;

    if (view === 'register') {
      if (students.find(s => s.email === email)) {
        setAuthError("Email already exists.");
        return;
      }
      const interests = INTERESTS.filter(i => fd.get(`interest-${i}`));
      const newUser: UserProfile = {
        email, name: fd.get('name') as string,
        password: pass,
        studentClass: fd.get('class') as StudentClass,
        language: lang,
        interests: interests.length ? interests : ['Science'],
        xp: 0, level: 1, isAdmin: email === ADMIN_EMAIL && pass === ADMIN_PASS,
        bio: ''
      };
      setUser(newUser);
      setStudents([...students, newUser]);
      setView('dash');
    } else {
      if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        const admin: UserProfile = { email, name: 'Sarvar', password: pass, studentClass: '9B', language: lang, interests: INTERESTS, xp: 9999, level: 99, isAdmin: true, bio: 'CEO ThinkFlow' };
        setUser(admin); setView('dash'); return;
      }
      const found = students.find(s => s.email === email);
      if (found && found.password === pass) { setUser(found); setView('dash'); }
      else { setAuthError(t.authError); }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Only images are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = (evt.target?.result as string).split(',')[1];
      setAttachment({ data: base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !attachment) || !user) return;
    setIsLoading(true);
    
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
    }

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now(), attachment: attachment || undefined };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');
    setAttachment(null);

    try {
      const aiResponse = await askThinkFlowAI(activeAI, input, user, messages, attachment || undefined);
      const modelMsg: Message = { role: 'model', text: aiResponse, timestamp: Date.now() };
      const updatedMessages = [...currentMessages, modelMsg];
      setMessages(updatedMessages);
      
      // Update history
      const newSession: ChatSession = {
        id: sessionId,
        title: input.slice(0, 30) || "New Session",
        type: activeAI,
        messages: updatedMessages,
        lastUpdated: Date.now()
      };
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      setSessions([newSession, ...filteredSessions]);

      setUser({ ...user, xp: user.xp + 15, level: Math.floor((user.xp + 15) / 100) + 1 });
    } catch (err) {
      setMessages([...currentMessages, { role: 'model', text: "Error connecting to AI Core.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (s: ChatSession) => {
    setCurrentSessionId(s.id);
    setMessages(s.messages);
    setActiveAI(s.type);
    setView('chat');
    setIsMobileMenuOpen(false);
  };

  const updateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const updated: UserProfile = {
      ...user,
      name: fd.get('name') as string,
      bio: fd.get('bio') as string,
      studentClass: fd.get('class') as StudentClass,
      interests: INTERESTS.filter(i => fd.get(`interest-${i}`))
    };
    setUser(updated);
    setStudents(students.map(s => s.email === user.email ? updated : s));
    alert("Profile Updated!");
  };

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= rating ? "text-yellow-500" : "text-slate-700 opacity-30"}>★</span>
      ))}
    </div>
  );

  const themeClasses = theme === 'dark' 
    ? { bg: 'bg-[#020204]', card: 'bg-[#0a0a0b]', input: 'bg-[#121214]', text: 'text-white', border: 'border-white/5', sub: 'text-slate-400' }
    : { bg: 'bg-[#f8f9fa]', card: 'bg-white', input: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-200', sub: 'text-slate-600' };

  if (view === 'landing') {
    return (
      <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} flex flex-col items-center p-6 text-center relative overflow-x-hidden transition-colors duration-500`}>
        <div className="absolute top-6 right-6 flex gap-3 z-50">
          <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase border border-white/10">{lang}</button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase border border-white/10">Theme</button>
        </div>
        <div className="max-w-5xl w-full pt-20 md:pt-32 space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl font-black mx-auto shadow-2xl">TF</div>
          <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-none italic">ThinkFlow</h1>
          <p className={`${themeClasses.sub} text-lg md:text-2xl max-w-3xl mx-auto font-medium`}>{t.sub}</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <button onClick={() => setView('register')} className="bg-indigo-600 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:scale-110 transition-all shadow-xl">{t.start}</button>
            <button onClick={() => setView('login')} className={`border ${themeClasses.border} px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white/5 transition-all`}>{t.login}</button>
          </div>
          <div className="pt-24 space-y-10 text-left">
            <h2 className="text-3xl font-black uppercase tracking-[0.3em] opacity-50 text-center">{t.features}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className={`${themeClasses.card} p-10 rounded-[3rem] border ${themeClasses.border} space-y-4 hover:border-indigo-500/30 transition-all`}>
                  <span className="text-4xl">🎓</span>
                  <h3 className="font-black uppercase text-sm tracking-widest">Concept Teacher</h3>
                  <p className={`${themeClasses.sub} text-sm leading-relaxed`}>{t.feat1}</p>
               </div>
               <div className={`${themeClasses.card} p-10 rounded-[3rem] border ${themeClasses.border} space-y-4 hover:border-indigo-500/30 transition-all`}>
                  <span className="text-4xl">🧠</span>
                  <h3 className="font-black uppercase text-sm tracking-widest">Thinking Coach</h3>
                  <p className={`${themeClasses.sub} text-sm leading-relaxed`}>{t.feat2}</p>
               </div>
               <div className={`${themeClasses.card} p-10 rounded-[3rem] border ${themeClasses.border} space-y-4 hover:border-indigo-500/30 transition-all`}>
                  <span className="text-4xl">⚡</span>
                  <h3 className="font-black uppercase text-sm tracking-widest">Adaptive Trainer</h3>
                  <p className={`${themeClasses.sub} text-sm leading-relaxed`}>{t.feat3}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex flex-col items-center justify-center p-6 transition-colors`}>
        <form onSubmit={handleAuth} className={`${themeClasses.card} p-10 md:p-14 rounded-[3.5rem] border ${themeClasses.border} w-full max-w-lg space-y-8 shadow-2xl animate-in slide-in-from-bottom-10`}>
          <h2 className={`text-4xl font-black uppercase text-center ${themeClasses.text}`}>{view === 'register' ? 'Register' : 'Login'}</h2>
          {authError && <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-bounce">{authError}</div>}
          <div className="space-y-4">
            {view === 'register' && <input name="name" placeholder="Full Name" title="Full Name" required className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none focus:border-indigo-500`} />}
            <input name="email" type="email" placeholder="Email" title="Email address" required className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none focus:border-indigo-500`} />
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Secret Key" title="Password" required className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none focus:border-indigo-500`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-slate-500 hover:text-indigo-500">
                {showPassword ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L5.146 5.147m13.71 13.71L14.12 14.121" /></svg>}
              </button>
            </div>
            {view === 'register' && (
              <select name="class" className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none`} title="Select your class">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          <button type="submit" className="w-full bg-indigo-600 py-6 rounded-3xl font-black uppercase text-white shadow-xl hover:brightness-110 active:scale-95 transition-all">Authorize</button>
          <button type="button" onClick={() => setView(view === 'login' ? 'register' : 'login')} className="w-full text-slate-500 text-[10px] font-black uppercase hover:text-indigo-500">{view === 'login' ? 'New here? Register' : 'Have account? Login'}</button>
          <button type="button" onClick={() => setView('landing')} className="w-full text-slate-700 text-[10px] font-black uppercase">Go Back</button>
        </form>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full flex ${themeClasses.bg} ${themeClasses.text} overflow-hidden relative transition-colors`}>
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 ${themeClasses.card} z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 border-r ${themeClasses.border} flex flex-col py-8 shadow-2xl overflow-hidden`}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dash')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">TF</div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">ThinkFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500" title="Close menu"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SideItem icon="grid" label={t.dash} active={view === 'dash'} onClick={() => setView('dash')} />
          <SideItem icon="book" label={t.teacher} active={view === 'chat' && activeAI === 'teacher'} onClick={() => { setView('chat'); setActiveAI('teacher'); setMessages([]); setCurrentSessionId(null); }} />
          <SideItem icon="chat" label={t.coach} active={view === 'chat' && activeAI === 'coach'} onClick={() => { setView('chat'); setActiveAI('coach'); setMessages([]); setCurrentSessionId(null); }} />
          <SideItem icon="zap" label={t.trainer} active={view === 'chat' && activeAI === 'trainer'} onClick={() => { setView('chat'); setActiveAI('trainer'); setMessages([]); setCurrentSessionId(null); }} />
          <SideItem icon="wall" label={t.wall} active={view === 'wall'} onClick={() => setView('wall')} />
          {user?.isAdmin && <SideItem icon="admin" label={t.admin} active={view === 'admin'} onClick={() => setView('admin')} />}
          
          <div className="pt-6 border-t border-white/5 space-y-2">
            <p className="px-7 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">{t.history}</p>
            {sessions.map(s => (
              <button key={s.id} onClick={() => loadSession(s)} className={`w-full px-7 py-3 rounded-xl text-left text-[11px] font-bold truncate transition-all ${currentSessionId === s.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-white/5'}`}>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 mt-auto border-t border-white/5 space-y-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl ${themeClasses.input} border ${themeClasses.border} hover:scale-[1.02] transition-all`}>
            {theme === 'dark' ? '☀️' : '🌙'} <span className="text-[10px] font-black uppercase tracking-widest">{t.theme}</span>
          </button>
          <div className={`p-4 ${themeClasses.input} rounded-2xl border ${themeClasses.border} flex items-center gap-3 cursor-pointer hover:border-indigo-500/30 transition-all`} onClick={() => setView('profile')}>
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">{user?.name?.[0]}</div>
             <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">{user?.name}</p>
                <p className="text-[9px] font-black uppercase text-slate-500">{user?.studentClass}</p>
             </div>
          </div>
          <button onClick={() => { setUser(null); setView('landing'); }} className="w-full text-slate-500 text-[10px] font-black uppercase text-left pl-4 hover:text-red-400 transition-colors">Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`h-20 border-b ${themeClasses.border} flex items-center justify-between px-8 md:px-12 backdrop-blur-xl z-40 transition-colors`}>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-400" title="Open menu"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">{view}</h2>
           </div>
           <div className="flex items-center gap-8">
              <div className="text-right hidden sm:block"><p className="text-[8px] font-black text-slate-500 uppercase">Status</p><p className="text-sm font-black text-green-500">Live AI</p></div>
              <div className="text-right"><p className="text-[8px] font-black text-slate-500 uppercase">Global XP</p><p className="text-xl font-black text-indigo-500">{user?.xp}</p></div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
          {view === 'dash' && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-16 rounded-[4rem] text-center text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <p className="text-4xl font-black italic relative z-10">"The future of learning isn't more books, it's better thinking."</p>
                 <p className="mt-8 text-[10px] font-black uppercase tracking-widest opacity-60">ThinkFlow Core Philosophy</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Knowledge Stream</h3>
                  {INITIAL_ARTICLES.map(a => (
                    <div key={a.id} className={`${themeClasses.card} p-8 rounded-[3rem] border ${themeClasses.border} hover:border-indigo-500/20 transition-all flex gap-8 group cursor-pointer shadow-sm`}>
                      <span className="text-5xl group-hover:scale-110 transition-transform">{a.icon}</span>
                      <div><h4 className="font-bold text-xl">{a.title}</h4><p className={`${themeClasses.sub} text-sm mt-2 leading-relaxed line-clamp-2`}>{a.content}</p><p className="text-[10px] font-black uppercase text-indigo-500 mt-4">{a.subject} • {a.author}</p></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">{t.reviews}</h3>
                  <div className={`${themeClasses.card} rounded-[3rem] border ${themeClasses.border} p-10 space-y-8 shadow-sm`}>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                      {reviews.map(r => (
                        <div key={r.id} className={`${themeClasses.input} p-6 rounded-3xl border ${themeClasses.border}`}>
                          <p className={`text-sm ${themeClasses.sub} font-medium`}>"{r.text}"</p>
                          <div className="flex justify-between items-center mt-4"><span className="text-[10px] font-black uppercase text-indigo-400">{r.userName}</span><Stars rating={r.rating} /></div>
                        </div>
                      ))}
                    </div>
                    <div className={`pt-6 border-t ${themeClasses.border} space-y-4`}>
                      <textarea value={reviewInput} onChange={e => setReviewInput(e.target.value)} placeholder={t.writeReview} className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all h-24`} />
                      <button onClick={() => { if(reviewInput.trim()){ setReviews([{id: Date.now().toString(), userName: user?.name || 'User', text: reviewInput, rating: 5, timestamp: Date.now()}, ...reviews]); setReviewInput(''); } }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">{t.submit}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-6 px-4">
                    <div className="w-32 h-32 bg-indigo-600/10 rounded-[3rem] flex items-center justify-center text-6xl">
                      {activeAI === 'teacher' ? '🎓' : activeAI === 'coach' ? '🧠' : '⚡'}
                    </div>
                    <div className="space-y-3">
                      <p className="text-3xl font-black uppercase tracking-tighter">ThinkFlow {activeAI}</p>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                        {activeAI === 'teacher' ? t.feat1 : activeAI === 'coach' ? t.feat2 : t.feat3}
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                      <div className={`max-w-[85%] p-8 rounded-[2.5rem] shadow-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : themeClasses.card + ' border ' + themeClasses.border + ' rounded-tl-none'}`}>
                        {m.attachment && <div className="mb-4 rounded-2xl overflow-hidden border border-white/10"><img src={`data:${m.attachment.mimeType};base64,${m.attachment.data}`} className="max-h-60 rounded-xl" alt="Attachment" /></div>}
                        <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">{m.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && <div className="text-indigo-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Thinking in {activeAI} mode...</div>}
              </div>
              <div className={`p-6 md:p-10 border-t ${themeClasses.border} ${themeClasses.card}`}>
                <div className="max-w-4xl mx-auto flex items-end gap-4 md:gap-6">
                  <div className="flex-1 relative">
                    {attachment && (
                      <div className="absolute -top-12 left-0 flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase animate-in slide-in-from-bottom-2">
                        <span>Attachment: {attachment.name}</span><button onClick={() => setAttachment(null)} className="ml-2 hover:text-red-400">✕</button>
                      </div>
                    )}
                    <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); sendMessage();}}} placeholder="Start thinking..." className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-[2rem] p-5 pr-16 outline-none focus:border-indigo-500 transition-all resize-none h-16 md:h-20`} />
                    <label className="absolute right-5 bottom-5 cursor-pointer text-slate-500 hover:text-indigo-500" title="Attach image">
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" title="Choose image" /><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </label>
                  </div>
                  <button onClick={sendMessage} disabled={(!input.trim()&&!attachment)||isLoading} className="bg-indigo-600 text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all" title="Send message"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </div>
          )}

          {view === 'profile' && user && (
            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in">
              <h2 className="text-5xl font-black uppercase tracking-tighter">{t.editProfile}</h2>
              <form onSubmit={updateProfile} className={`${themeClasses.card} p-12 rounded-[3.5rem] border ${themeClasses.border} space-y-8 shadow-2xl`}>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.name}</label>
                    <input name="name" defaultValue={user.name} title={t.name} className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none focus:border-indigo-500`} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.bio}</label>
                    <textarea name="bio" defaultValue={user.bio} className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none focus:border-indigo-500 h-32 resize-none`} placeholder="Tell about yourself" title="Your bio" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Class</label>
                    <select name="class" defaultValue={user.studentClass} className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-2xl p-5 ${themeClasses.text} outline-none`} title="Select your class">
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interests</label>
                    <div className={`p-6 ${themeClasses.input} rounded-2xl border ${themeClasses.border} grid grid-cols-2 sm:grid-cols-3 gap-3`}>
                      {INTERESTS.map(i => (
                        <label key={i} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-500 cursor-pointer">
                          <input type="checkbox" name={`interest-${i}`} defaultChecked={user.interests.includes(i)} /> {i}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] font-black uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all">{t.update}</button>
              </form>
            </div>
          )}

          {view === 'wall' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Leaderboard</h2>
              <div className="space-y-4">
                {students.sort((a,b) => b.xp - a.xp).map((s, i) => (
                  <div key={s.email} className={`p-10 rounded-[3rem] border ${s.email === user?.email ? 'bg-indigo-600/10 border-indigo-500/30' : themeClasses.card + ' ' + themeClasses.border} flex justify-between items-center shadow-sm`}>
                    <div className="flex items-center gap-10">
                      <span className="text-4xl font-black opacity-20">{i+1}</span>
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-black text-2xl text-indigo-500">{s.name?.[0]}</div>
                      <div><p className="font-black uppercase text-xl">{s.name}</p><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">LVL {s.level} • {s.studentClass}</p></div>
                    </div>
                    <p className="text-4xl font-black text-indigo-500 font-mono tracking-tighter">{s.xp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'admin' && user?.isAdmin && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in">
              <h2 className="text-4xl font-black uppercase tracking-tighter">System Console</h2>
              <div className={`${themeClasses.card} rounded-[3rem] border ${themeClasses.border} overflow-hidden shadow-2xl`}>
                <table className="w-full text-left">
                  <thead className={`${themeClasses.input}`}><tr><th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-50">Student</th><th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-50">Global XP</th><th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-50">Actions</th></tr></thead>
                  <tbody>{students.filter(s => s.email !== ADMIN_EMAIL).map(s => (
                    <tr key={s.email} className={`border-t ${themeClasses.border}`}><td className="p-8 font-bold">{s.name}<br/><span className="text-[10px] opacity-40 uppercase font-black">{s.email}</span></td><td className="p-8 font-black text-indigo-500">{s.xp}</td><td className="p-8 flex gap-3"><button onClick={() => setStudents(students.map(st => st.email===s.email ? {...st, xp: st.xp+100, level: Math.floor((st.xp+100)/100)+1} : st))} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">+100 XP</button><button onClick={() => setStudents(students.filter(st => st.email !== s.email))} className="bg-red-600/10 text-red-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Ban</button></td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/90 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
};

const SideItem = ({ icon, label, active, onClick }: any) => {
  const icons: Record<string, any> = {
    grid: <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />,
    book: <path d="M12 3v15m0 0l-7-3V3l7 3m0 12l7-3V3l-7 3" />,
    chat: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
    zap: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    wall: <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96" />,
    admin: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 px-7 py-5 rounded-2xl transition-all group ${active ? 'bg-indigo-600 text-white font-black shadow-lg' : 'text-slate-500 hover:text-indigo-500 hover:bg-white/5'}`}>
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{icons[icon]}</svg>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
};

export default App;
