
import React from 'react';
import { Lightbulb, Clock, BookOpen, CheckCircle2, ArrowRight, Star, Target, Zap, FileText, BarChart3, Quote, Sparkles, Users, Brain } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';

export const Tips: React.FC = () => {
  const { t, language } = useLanguage();

  const satTips = language === 'ru' ? [
    { title: "Техника Фейнмана", desc: "Объясните сложную задачу SAT 10-летнему ребенку. Если вы не можете — вы не понимаете ее до конца.", icon: Brain },
    { title: "Интервальные повторения", desc: "Не зубрите всё сразу. Повторяйте сложные правила через 1, 3 и 7 дней для вечного запоминания.", icon: Zap },
    { title: "Активное вспоминание", desc: "Вместо чтения конспектов, закройте книгу и запишите всё, что помните. Это в 3 раза эффективнее.", icon: BookOpen },
    { title: "Эффект Зейгарник", desc: "Делайте перерыв на самом интересном месте задачи. Мозг продолжит решать ее в фоновом режиме.", icon: Target },
    { title: "Метод исключения", desc: "В SAT всегда 3 ответа абсолютно неверны. Ищите ошибки, а не правильный ответ.", icon: CheckCircle2 },
    { title: "Темп в математике", desc: "Первые 10 вопросов — это разминка. Решайте их за 5 минут, чтобы оставить время на финал.", icon: Clock },
    { title: "Грамматический скелет", desc: "Игнорируйте лишние слова в предложении. Найдите только подлежащее и сказуемое.", icon: FileText },
    { title: "Визуализация данных", desc: "В секции анализа данных сначала посмотрите на оси графика, а потом на сам вопрос.", icon: BarChart3 },
  ] : language === 'uz' ? [
    { title: "Feynman texnikasi", desc: "Murakkab SAT muammosini 10 yoshli bolaga tushuntiring. Agar tushuntirolmasangiz, demak o'zingiz ham hali to'liq tushunmagansiz.", icon: Brain },
    { title: "Interval takrorlash", desc: "Hammasini birdan yodlamang. Doimiy xotira uchun qiyin qoidalarni 1, 3 va 7 kunlik intervallarda takrorlang.", icon: Zap },
    { title: "Faol eslash", desc: "Konspektlarni qayta o'qish o'rniga, kitobni yoping va eslagan hamma narsangizni yozing. Bu 3 baravar samaraliroq.", icon: BookOpen },
    { title: "Zeygarnik effekti", desc: "Muammoning eng qiziqarli joyida tanaffus qiling. Miyangiz uni fonda hal qilishda davom etadi.", icon: Target },
    { title: "Istisno qilish usuli", desc: "SATda 3 ta javob har doim xato bo'ladi. To'g'ri javobni emas, xatolarni qidiring.", icon: CheckCircle2 },
    { title: "Matematika sur'ati", desc: "Dastlabki 10 ta savol - bu isinish. Final uchun vaqtni tejash uchun ularni 5 daqiqada hal qiling.", icon: Clock },
    { title: "Grammatika skeleti", desc: "Gapdagi ortiqcha so'zlarga e'tibor bermang. Xatolarni aniqlash uchun faqat ega va kesimni toping.", icon: FileText },
    { title: "Ma'lumotlarni vizuallashtirish", desc: "Ma'lumotlarni tahlil qilish bo'limida avval grafik o'qlariga, keyin savolning o'ziga qarang.", icon: BarChart3 },
  ] : [
    { title: "Feynman Technique", desc: "Explain a complex SAT problem to a 10-year-old. If you can't, you don't fully understand it yet.", icon: Brain },
    { title: "Spaced Repetition", desc: "Don't cram. Review hard rules at 1, 3, and 7-day intervals for permanent memory.", icon: Zap },
    { title: "Active Recall", desc: "Instead of re-reading notes, close the book and write down everything you remember. It's 3x more effective.", icon: BookOpen },
    { title: "Zeigarnik Effect", desc: "Take a break at the most interesting part of a problem. Your brain will keep solving it in the background.", icon: Target },
    { title: "Process of Elimination", desc: "In SAT, 3 answers are always objectively wrong. Look for errors, not the right answer.", icon: CheckCircle2 },
    { title: "Math Pacing", desc: "The first 10 questions are a warm-up. Solve them in 5 mins to save time for the finale.", icon: Clock },
    { title: "Grammar Skeleton", desc: "Ignore extra words in a sentence. Find only the subject and the verb to spot errors.", icon: FileText },
    { title: "Data Visualization", desc: "In the data analysis section, look at the graph axes first, then the question itself.", icon: BarChart3 },
  ];

  const ieltsTips = language === 'ru' ? [
    { title: "Эффект погружения", desc: "Слушайте подкасты на 1.5x скорости. Обычный темп на экзамене покажется вам замедленным.", icon: Star },
    { title: "Структура PEEL", desc: "Point, Evidence, Explanation, Link. Используйте это для каждого абзаца в Writing Task 2.", icon: CheckCircle2 },
    { title: "Предсказание ответов", desc: "В аудировании читайте вопросы заранее и угадывайте часть речи (существительное, число и т.д.).", icon: Target },
    { title: "Сканирование по ключевым словам", desc: "Ищите не слова из вопроса, а их синонимы. IELTS всегда парафразирует.", icon: BookOpen },
    { title: "Парафразирование", desc: "Никогда не копируйте слова из вопроса. Используйте синонимы, чтобы показать свой уровень.", icon: Quote },
    { title: "Обзор Task 1", desc: "Без четкого Overview (обзора тенденций) вы никогда не получите выше 6.0 за Task 1.", icon: BarChart3 },
    { title: "Точность написания", desc: "В аудировании 'accommodation' с одной 'm' — это 0 баллов. Проверяйте двойные буквы.", icon: CheckCircle2 },
    { title: "Сложные структуры", desc: "Используйте Conditionals (If...) и Inversion (Not only...), чтобы удивить экзаменатора.", icon: Zap },
    { title: "Использование синонимов", desc: "Замените 'very good' на 'exceptional' или 'outstanding'. Это сразу поднимет балл.", icon: Sparkles },
    { title: "Тайм-менеджмент", desc: "Task 2 дает 66% баллов за письмо. Начинайте с него, если боитесь не успеть.", icon: Clock },
    { title: "Идиомы в Speaking", desc: "Используйте 'once in a blue moon' вместо 'rarely'. Это звучит как носитель языка.", icon: Quote },
    { title: "Критическая проверка", desc: "Оставьте 2 минуты на проверку артиклей 'a/an/the' и окончаний '-s' у глаголов.", icon: CheckCircle2 },
  ] : language === 'uz' ? [
    { title: "Sho'ng'ish effekti", desc: "Podkastlarni 1.5x tezlikda tinglang. Imtihondagi odatiy sur'at sizga sekin harakatlanayotgandek tuyuladi.", icon: Star },
    { title: "PEEL tuzilishi", desc: "Point, Evidence, Explanation, Link. Buni Writing Task 2 dagi har bir paragraf uchun ishlating.", icon: CheckCircle2 },
    { title: "Javobni bashorat qilish", desc: "Listening bo'limida savollarni oldindan o'qing va so'z turkumini (ot, son va h.k.) taxmin qiling.", icon: Target },
    { title: "Kalit so'zlarni skanerlash", desc: "Savoldagi so'zlarni qidirmang; ularning sinonimlarini qidiring. IELTS har doim parafraz qiladi.", icon: BookOpen },
    { title: "Parafraz qilish", desc: "Hech qachon savoldagi so'zlarni nusxalamang. O'z darajangizni ko'rsatish uchun sinonimlardan foydalaning.", icon: Quote },
    { title: "Task 1 sharhi", desc: "Aniq Overview (trend xulosasi) bo'lmasa, Task 1 uchun hech qachon 6.0 dan yuqori ball ololmaysiz.", icon: BarChart3 },
    { title: "Imlo aniqligi", desc: "Listeningda bitta 'm' bilan yozilgan 'accommodation' 0 ball hisoblanadi. Ikki baravar harflarni diqqat bilan tekshiring.", icon: CheckCircle2 },
    { title: "Murakkab tuzilmalar", desc: "Imtihon oluvchini hayratda qoldirish uchun Conditionals (If...) va Inversion (Not only...) dan foydalaning.", icon: Zap },
    { title: "Sinonimlardan foydalanish", desc: "'Very good' so'zini 'exceptional' yoki 'outstanding' bilan almashtiring. Bu balingizni darhol oshiradi.", icon: Sparkles },
    { title: "Vaqtni boshqarish", desc: "Task 2 yozish balingizning 66 foizini beradi. Agar vaqtdan xavotirda bo'lsangiz, undan boshlang.", icon: Clock },
    { title: "Speakingda idiomalar", desc: "'Rarely' o'rniga 'once in a blue moon' dan foydalaning. Bu ona tilida so'zlashuvchidek eshitiladi.", icon: Quote },
    { title: "Tanqidiy tekshirish", desc: "Fe'llardagi 'a/an/the' artikllari va '-s' qo'shimchalarini tekshirish uchun 2 daqiqa qoldiring.", icon: CheckCircle2 },
  ] : [
    { title: "Immersion Effect", desc: "Listen to podcasts at 1.5x speed. The normal exam pace will feel slow-motion to you.", icon: Star },
    { title: "PEEL Structure", desc: "Point, Evidence, Explanation, Link. Use this for every paragraph in Writing Task 2.", icon: CheckCircle2 },
    { title: "Answer Prediction", desc: "In Listening, read questions ahead and guess the part of speech (noun, number, etc.).", icon: Target },
    { title: "Keyword Scanning", desc: "Don't look for words from the question; look for their synonyms. IELTS always paraphrases.", icon: BookOpen },
    { title: "Paraphrasing", desc: "Never copy words from the question. Use synonyms to demonstrate your range.", icon: Quote },
    { title: "Task 1 Overview", desc: "Without a clear Overview (trend summary), you'll never get above 6.0 for Task 1.", icon: BarChart3 },
    { title: "Spelling Accuracy", desc: "In Listening, 'accommodation' with one 'm' is 0 points. Check double letters carefully.", icon: CheckCircle2 },
    { title: "Complex Structures", desc: "Use Conditionals (If...) and Inversion (Not only...) to impress the examiner.", icon: Zap },
    { title: "Synonym Usage", desc: "Replace 'very good' with 'exceptional' or 'outstanding'. It boosts your score instantly.", icon: Sparkles },
    { title: "Time Management", desc: "Task 2 is worth 66% of your writing score. Start with it if you're worried about time.", icon: Clock },
    { title: "Idioms in Speaking", desc: "Use 'once in a blue moon' instead of 'rarely'. It sounds more like a native speaker.", icon: Quote },
    { title: "Critical Proofreading", desc: "Leave 2 mins to check 'a/an/the' articles and '-s' endings on verbs.", icon: CheckCircle2 },
  ];

  const generalTips = language === 'ru' ? [
    { title: "Дворец памяти", desc: "Привязывайте факты к комнатам в вашем доме. Прогулка по дому в уме поможет вспомнить всё.", icon: Clock },
    { title: "Интерливинг", desc: "Смешивайте разные темы в одной сессии. Это учит мозг выбирать правильный метод решения.", icon: Zap },
    { title: "Кривая забывания", desc: "Повторите материал через 20 минут, 1 час и 9 часов. Это закрепит его в памяти.", icon: Clock },
    { title: "Ультрадианные ритмы", desc: "Работайте 90 минут, затем отдыхайте 20. Это соответствует природным циклам мозга.", icon: Users },
  ] : language === 'uz' ? [
    { title: "Xotira saroyi", desc: "Faktlarni uyingizdagi xonalar bilan bog'lang. Xayolan uyingizda yurish hamma narsani eslashga yordam beradi.", icon: Clock },
    { title: "Interleaving", desc: "Bir seansda turli mavzularni aralashtiring. Bu miyani to'g'ri yechim usulini tanlashga o'rgatadi.", icon: Zap },
    { title: "Unutish egri chizig'i", desc: "Materialni 20 daqiqa, 1 soat va 9 soatdan keyin takrorlang. Bu uni uzoq muddatli xotiraga muhrlaydi.", icon: Clock },
    { title: "Ultradian ritmlar", desc: "90 daqiqa ishlang, keyin 20 daqiqa dam oling. Bu miyaning tabiiy energiya davrlariga mos keladi.", icon: Users },
  ] : [
    { title: "Memory Palace", desc: "Link facts to rooms in your house. Walking through your home mentally helps you recall everything.", icon: Clock },
    { title: "Interleaving", desc: "Mix different subjects in one session. It trains your brain to choose the right solution method.", icon: Zap },
    { title: "Forgetting Curve", desc: "Review material after 20 mins, 1 hour, and 9 hours. This locks it into long-term memory.", icon: Clock },
    { title: "Ultradian Rhythms", desc: "Work for 90 mins, then rest for 20. This matches the brain's natural energy cycles.", icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-6xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.tips}
          </h2>
          <p className="text-[var(--muted)] font-medium max-w-2xl text-lg">
            {t.tipsSub}
          </p>
        </div>
        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 shadow-inner">
          <Lightbulb className="w-12 h-12" />
        </div>
      </div>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <span className="font-black text-2xl">SAT</span>
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight text-[var(--text)]">{t.sat}</h3>
            <p className="text-[var(--muted)] text-sm font-medium">{t.satTips}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {satTips.map((tip, i) => (
            <Card key={i} hover className="p-8 rounded-[2.5rem] group cursor-pointer flex flex-col">
              <div className="w-14 h-14 bg-[var(--input)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <tip.icon className="w-6 h-6 text-indigo-500" />
              </div>
              <h4 className="text-xl font-black mb-3 text-[var(--text)] group-hover:text-indigo-500 transition-colors">{tip.title}</h4>
              <p className="text-[var(--muted)] text-xs leading-relaxed mb-6 flex-1">{tip.desc}</p>
              <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-2 transition-transform" />
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <span className="font-black text-2xl">IELTS</span>
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight text-[var(--text)]">{t.ielts}</h3>
            <p className="text-[var(--muted)] text-sm font-medium">{t.ieltsTips}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ieltsTips.map((tip, i) => (
            <Card key={i} hover className="p-8 rounded-[2.5rem] group cursor-pointer flex flex-col">
              <div className="w-14 h-14 bg-[var(--input)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <tip.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-xl font-black mb-3 text-[var(--text)] group-hover:text-emerald-500 transition-colors">{tip.title}</h4>
              <p className="text-[var(--muted)] text-xs leading-relaxed mb-6 flex-1">{tip.desc}</p>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-2 transition-transform" />
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <span className="font-black text-2xl">GEN</span>
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight text-[var(--text)]">
              {t.generalTips}
            </h3>
            <p className="text-[var(--muted)] text-sm font-medium">
              {t.generalTipsSub}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generalTips.map((tip, i) => (
            <Card key={i} hover className="p-8 rounded-[2.5rem] group cursor-pointer flex flex-col">
              <div className="w-14 h-14 bg-[var(--input)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <tip.icon className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-xl font-black mb-3 text-[var(--text)] group-hover:text-purple-500 transition-colors">{tip.title}</h4>
              <p className="text-[var(--muted)] text-xs leading-relaxed mb-6 flex-1">{tip.desc}</p>
              <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-2 transition-transform" />
            </Card>
          ))}
        </div>
      </section>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-40 h-40 bg-white/10 rounded-[3rem] shrink-0 flex items-center justify-center text-6xl shadow-2xl relative z-10">
          💡
        </div>
        <div className="space-y-6 relative z-10">
          <h3 className="text-3xl font-black uppercase tracking-tighter">
            {t.proTipTitle}
          </h3>
          <p className="text-white/80 leading-relaxed text-lg font-medium">
            {t.proTipDesc}
          </p>
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              {t.reasoning}
            </span>
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              {t.logic}
            </span>
            <span className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              {t.mastery}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
