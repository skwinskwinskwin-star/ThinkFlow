
import { Article, Language, StudentClass, Quote } from './types';

export const INTERESTS = ['Sports', 'Football', 'Chess', 'Anime', 'Music', 'Design', 'Coding', 'Cooking', 'Cars', 'Business', 'Gaming', 'Movies', 'Art', 'Fitness', 'Science'];
export const CLASSES: StudentClass[] = ['7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B'];

export const INITIAL_ARTICLES: Article[] = [
  { id: 'p1', subject: 'Physics', title: 'Momentum in Sports', content: 'Physics isn\'t just in books. When a player kicks a ball, the conservation of momentum is what makes it soar...', author: 'Dr. Newton', icon: '⚛️' },
  { id: 'a1', subject: 'Algebra', title: 'The Algorithm of Life', content: 'Variables are empty slots waiting for purpose. Solving for X is solving for the unknown in your future...', author: 'Al-Khwarizmi', icon: '📐' },
  { id: 'e1', subject: 'English', title: 'Persuasive Flows', content: 'In English, flow is everything. It’s not about words, it’s about the rhythm of logic...', author: 'Shakespeare', icon: '✍️' }
];

export const INITIAL_QUOTES: Quote[] = [
  { id: 'q1', text: "The future of learning isn't more books, it's better thinking.", author: "ThinkFlow Core", category: "education" },
  { id: 'q2', text: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein", category: "thinking" },
  { id: 'q3', text: "The important thing is not to stop questioning.", author: "Albert Einstein", category: "science" },
  { id: 'q4', text: "I have no special talent. I am only passionately curious.", author: "Albert Einstein", category: "learning" }
];

export const TRANSLATIONS = {
  en: {
    hero: "Think Better, Not Faster.",
    sub: "ThinkFlow is a global EdTech platform that switches your brain from memorizing to understanding.",
    features: "What's Inside?",
    feat1: "Concept Teacher: Learns your interests and explains topics through them.",
    feat2: "Thinking Coach: Uses Socratic method—asks questions instead of giving answers.",
    feat3: "Adaptive Trainer: Personalized challenges that grow with your logic.",
    start: "Get Started", login: "Login", register: "Register", logout: "Logout",
    dash: "Dashboard", teacher: "Concept Teacher", coach: "Thinking Coach", trainer: "Adaptive Trainer",
    wall: "Hall of Fame", profile: "Profile", admin: "System Admin",
    save: "Apply Changes", reviews: "Community Reviews", history: "Recent Sessions",
    authError: "Access Denied. Check your credentials.",
    writeReview: "Share your experience", submit: "Post",
    theme: "Toggle Theme",
    language: "Language",
    editProfile: "Edit Profile",
    name: "Full Name", bio: "Bio", update: "Update Profile",
    tasks: "Tasks", progress: "Progress", articles: "Articles", tips: "Tips", quotes: "Quotes", leaderboard: "Leaderboard", settings: "Settings",
    learn: "Learn",
    easy: "Easy", medium: "Medium", challenge: "Challenge",
    complete: "Complete", pending: "Pending",
    xp: "XP", level: "Level",
    sat: "SAT Tips", ielts: "IELTS Tips",
    satTips: "SAT study strategies, time management, math tricks, reading strategies.",
    ieltsTips: "Speaking tips, writing tips, listening strategies, reading strategies, band score advice."
  },
  ru: {
    hero: "Думай лучше, а не быстрее.",
    sub: "ThinkFlow — это глобальная EdTech платформа, которая переключает ваш мозг с запоминания на понимание.",
    features: "Что внутри?",
    feat1: "Учитель Концептов: Объясняет темы через твои интересы (футбол, аниме, код).",
    feat2: "Коуч Мышления: Сократовский метод — учит тебя находить ответы самому.",
    feat3: "Адаптивный Тренер: Задачи, которые подстраиваются под твой уровень логики.",
    start: "Начать", login: "Войти", register: "Регистрация", logout: "Выйти",
    dash: "Главная", teacher: "Учитель концептов", coach: "Коуч мышления", trainer: "Адаптивный тренер",
    wall: "Зал славы", profile: "Профиль", admin: "Админ-панель",
    save: "Сохранить", reviews: "Отзывы сообщества", history: "История сессий",
    authError: "Доступ запрещен. Проверьте данные.",
    writeReview: "Поделитесь опытом", submit: "Опубликовать",
    theme: "Сменить тему",
    language: "Язык",
    editProfile: "Редактор профиля",
    name: "ФИО", bio: "О себе", update: "Обновить профиль",
    tasks: "Задания", progress: "Прогресс", articles: "Статьи", tips: "Советы", quotes: "Цитаты", leaderboard: "Лидерборд", settings: "Настройки",
    learn: "Обучение",
    easy: "Легко", medium: "Средне", challenge: "Вызов",
    complete: "Завершено", pending: "В процессе",
    xp: "Опыт", level: "Уровень",
    sat: "Советы по SAT", ielts: "Советы по IELTS",
    satTips: "Стратегии подготовки к SAT, тайм-менеджмент, математические трюки.",
    ieltsTips: "Советы по говорению, письму, аудированию и чтению IELTS."
  },
  uz: {
    hero: "Yaxshiroq o'ylang, tezroq emas.",
    sub: "ThinkFlow — bu sizning miyangizni yodlashdan tushunishga o'tkazadigan global EdTech platformasi.",
    features: "Ichida nima bor?",
    feat1: "Konsept Ustoz: Mavzularni sizning qiziqishlaringiz orqali tushuntiradi.",
    feat2: "Fikrlash Murabbiyi: Savollar orqali yechimni o'zingiz topishingizga yordam beradi.",
    feat3: "Moslashuvchan Trener: Sizning darajangizga mos vazifalar generatori.",
    start: "Boshlash", login: "Kirish", register: "Ro'yxatdan o'tish", logout: "Chiqish",
    dash: "Asosiy", teacher: "Konsept Ustoz", coach: "Fikrlash Murabbiyi", trainer: "Trener",
    wall: "Reyting", profile: "Profil", admin: "Admin Paneli",
    save: "Saqlash", reviews: "Sharhlar", history: "Tarix",
    authError: "Xatolik. Ma'lumotlarni tekshiring.",
    writeReview: "Fikringizni yozing", submit: "Yuborish",
    theme: "Mavzu o'zgartirish",
    language: "Til",
    editProfile: "Profilni tahrirlash",
    name: "Ism sharif", bio: "Ma'lumot", update: "Yangilash",
    tasks: "Vazifalar", progress: "Yutuqlar", articles: "Maqolalar", tips: "Maslahatlar", quotes: "Iqtiboslar", leaderboard: "Reyting", settings: "Sozlamalar",
    learn: "O'rganish",
    easy: "Oson", medium: "O'rtacha", challenge: "Qiyin",
    complete: "Bajarildi", pending: "Kutilmoqda",
    xp: "XP", level: "Daraja",
    sat: "SAT Maslahatlari", ielts: "IELTS Maslahatlari",
    satTips: "SAT o'qish strategiyalari, vaqtni boshqarish, matematika usullari.",
    ieltsTips: "IELTS gapirish, yozish, tinglash va o'qish bo'yicha maslahatlar."
  }
};
