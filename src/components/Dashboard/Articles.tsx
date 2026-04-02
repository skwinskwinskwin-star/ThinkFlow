
import React from 'react';
import { FileText, ArrowRight, BookOpen, GraduationCap, Atom, Calculator, PenTool, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_ARTICLES } from '../../constants';
import { Card } from '../UI/Card';

export const Articles: React.FC = () => {
  const { t, language } = useLanguage();

  const translatedArticles = INITIAL_ARTICLES.map(article => {
    if (language === 'ru') {
      const ruArticles: Record<string, any> = {
        'p1': { title: 'Импульс в спорте', content: 'Физика — это не только книги. Когда игрок бьет по мячу, закон сохранения импульса — это то, что заставляет его лететь...', author: 'Д-р Ньютон' },
        'a1': { title: 'Алгоритм жизни', content: 'Переменные — это пустые слоты, ждущие цели. Решить уравнение X — значит решить неизвестное в вашем будущем...', author: 'Аль-Хорезми' },
        'e1': { title: 'Убедительные потоки', content: 'В английском языке поток — это всё. Дело не в словах, а в ритме логики...', author: 'Шекспир' },
        'b1': { title: 'Логика клеток', content: 'Каждая клетка в вашем теле — это крошечный компьютер, выполняющий инструкции. Понимание биологии — это понимание совершенного ПО...', author: 'Дарвин' },
        'c1': { title: 'Атомные связи', content: 'Химия — это изучение отношений. То, как атомы выбирают связь или отталкивание, является основой всего, к чему мы прикасаемся...', author: 'Кюри' },
        'h1': { title: 'Паттерны времени', content: 'История не повторяется, но она рифмуется. Распознавание паттернов прошлого позволяет нам предсказывать потоки будущего...', author: 'Геродот' }
      };
      return { ...article, ...ruArticles[article.id] };
    }
    if (language === 'uz') {
      const uzArticles: Record<string, any> = {
        'p1': { title: 'Sportda impuls', content: 'Fizika faqat kitoblarda emas. O\'yinchi to\'pni tepganida, impulsning saqlanish qonuni uni parvoz qildiradi...', author: 'Doktor Nyuton' },
        'a1': { title: 'Hayot algoritmi', content: 'O\'zgaruvchilar - bu maqsadni kutayotgan bo\'sh joylar. X ni topish - kelajagingizdagi noma\'lumni topishdir...', author: 'Al-Xorazmiy' },
        'e1': { title: 'Ishonarli oqimlar', content: 'Ingliz tilida oqim hamma narsadir. Gap so\'zlarda emas, mantiq ritmida...', author: 'Shekspir' },
        'b1': { title: 'Hujayralar mantig\'i', content: 'Tanangizdagi har bir hujayra ko\'rsatmalarni bajaradigan kichik kompyuterdir. Biologiyani tushunish - bu eng mukammal dasturiy ta\'minotni tushunishdir...', author: 'Darvin' },
        'c1': { title: 'Atom aloqalari', content: 'Kimyo - bu munosabatlarni o\'rganishdir. Atomlar qanday qilib bog\'lanishni yoki itarishni tanlashi biz tegadigan hamma narsaning asosidir...', author: 'Kyuri' },
        'h1': { title: 'Vaqt naqshlari', content: 'Tarix takrorlanmaydi, lekin u qofiyalanadi. O\'tmish naqshlarini tan olish bizga kelajak oqimlarini bashorat qilish imkonini beradi...', author: 'Gerodot' }
      };
      return { ...article, ...uzArticles[article.id] };
    }
    return article;
  });

  const getIcon = (subject: string) => {
    switch (subject) {
      case 'Physics': return <Atom className="w-10 h-10 text-indigo-500" />;
      case 'Algebra': return <Calculator className="w-10 h-10 text-purple-500" />;
      case 'English': return <PenTool className="w-10 h-10 text-emerald-500" />;
      case 'Biology': return <Zap className="w-10 h-10 text-rose-500" />;
      case 'Chemistry': return <Atom className="w-10 h-10 text-cyan-500" />;
      case 'History': return <FileText className="w-10 h-10 text-amber-500" />;
      default: return <BookOpen className="w-10 h-10 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.articles}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            {t.articlesSub}
          </p>
        </div>
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <FileText className="w-10 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {translatedArticles.map((article) => (
          <Card 
            key={article.id} 
            hover 
            className="flex flex-col h-full group cursor-pointer p-10 rounded-[3.5rem]"
          >
            <div className="mb-8 flex justify-between items-start">
              <div className="w-20 h-20 bg-[var(--input)] rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {getIcon(article.subject)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] bg-[var(--input)] px-4 py-2 rounded-full">
                {article.subject}
              </span>
            </div>

            <h3 className="text-2xl font-black mb-4 text-[var(--text)] group-hover:text-indigo-500 transition-colors leading-tight">
              {article.title}
            </h3>
            <p className="text-[var(--muted)] text-sm leading-relaxed mb-8 line-clamp-4 flex-1">
              {article.content}
            </p>

            <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                  {article.author[0]}
                </div>
                <span className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">
                  {article.author}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-2 transition-transform" />
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-16 rounded-[4rem] text-center text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <GraduationCap className="w-20 h-20 mx-auto mb-8 text-white/50" />
        <h3 className="text-4xl font-black italic relative z-10">
          "{t.philosophy}"
        </h3>
        <p className="mt-8 text-[10px] font-black uppercase tracking-widest opacity-60">
          {t.philosophySub}
        </p>
      </div>
    </div>
  );
};
