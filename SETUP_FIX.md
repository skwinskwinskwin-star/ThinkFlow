# 🚀 ThinkFlow AI - Как Исправить

## Проблема
Сайт не работает потому что **отсутствует API ключ** в GitHub.

## ✅ Решение (Выберите один из способов)

### Способ 1️⃣: Локальный запуск (Для разработки)

```bash
# 1. Скачайте проект
git clone https://github.com/YOUR_USERNAME/thinkflow-ai.git
cd thinkflow-ai

# 2. Создайте .env.local файл
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 3. Получите ключ: https://aistudio.google.com/apikey
# 4. Замените your_key_here на реальный ключ в .env.local

# 5. Установите зависимости и запустите
npm install
npm run dev
```

Доступно на: **http://localhost:3000**

---

### Способ 2️⃣: Vercel (Рекомендуется) ✨

1. Перейдите на https://vercel.com
2. Нажмите "Import Project"
3. Выберите ваш GitHub репозиторий
4. Добавьте переменную окружения:
   - Имя: `GEMINI_API_KEY`
   - Значение: Ваш ключ с https://aistudio.google.com/apikey
5. Нажмите "Deploy"

---

### Способ 3️⃣: Netlify

1. Перейдите на https://netlify.com
2. Нажмите "Import an existing project"
3. Выберите GitHub репо
4. В Build settings добавьте:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Добавьте Environment переменные
6. Deploy

---

## 📋 Требования
- Node.js 16+
- npm или yarn
- Gemini API ключ (бесплатно на https://aistudio.google.com/apikey)

---

## ❓ Что происходит?

- ✅ React + TypeScript приложение
- ✅ Vite для быстрого развития
- ✅ Gemini AI для обучения студентов
- ✅ Локальное хранилище данных
- ✅ Dark/Light тема
- ✅ Мультиязычность (EN, RU, UZ)

---

**Всё готово после добавления API ключа! 🎉**
