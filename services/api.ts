
import { UserProfile, ChatSession, Review } from '../types';

/**
 * THINKFLOW GLOBAL API SERVICE
 * Currently uses LocalStorage for demo purposes.
 * To make this truly GLOBAL (everyone sees everyone), 
 * you should connect this to a service like Supabase.
 */

const STORAGE_KEYS = {
  USERS: 'tf_global_users',
  SESSIONS: 'tf_global_sessions',
  REVIEWS: 'tf_global_reviews'
};

const ADMIN_CREDENTIALS = {
  email: 'skwinskwinskwin@gmail.com',
  pass: 'sarvar1212333323211112123333232111'
};

// --- CLOUD CONFIG PLACEHOLDER ---
// When you're ready for a real backend, you'll put your Cloud URL here.
const CLOUD_API_ENABLED = false; 

export const MockBackend = {
  // --- AUTH & ACCOUNTS ---
  getUsers: (): UserProfile[] => {
    // If CLOUD_API_ENABLED was true, we would fetch from a real database here.
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: UserProfile) => {
    const users = MockBackend.getUsers();
    const index = users.findIndex(u => u.email === user.email.toLowerCase());
    const normalizedUser = { ...user, email: user.email.toLowerCase() };
    
    if (index > -1) {
      users[index] = normalizedUser;
    } else {
      users.push(normalizedUser);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // In Global Mode: await fetch('your-api/users', { method: 'POST', body: JSON.stringify(user) });
  },

  login: (email: string, pass: string): UserProfile | null => {
    const normalizedEmail = email.toLowerCase().trim();
    const users = MockBackend.getUsers();
    
    // 1. Check Admin Bypass
    if (normalizedEmail === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.pass) {
      let admin = users.find(u => u.email === normalizedEmail);
      if (!admin) {
        admin = {
          email: normalizedEmail,
          name: 'Sarvar (Admin)',
          password: pass,
          studentClass: '9B',
          language: 'ru',
          interests: ['Coding', 'AI', 'Design'],
          xp: 1000,
          level: 10,
          isAdmin: true,
          bio: 'ThinkFlow Creator'
        };
        MockBackend.saveUser(admin);
      }
      return admin;
    }

    // 2. Normal User Check
    const user = users.find(u => u.email === normalizedEmail);
    if (user && user.password === pass) return user;
    
    return null;
  },

  // --- PROGRESS & XP ---
  updateXP: (email: string, amount: number) => {
    const users = MockBackend.getUsers();
    const index = users.findIndex(u => u.email === email.toLowerCase());
    if (index > -1) {
      users[index].xp += amount;
      users[index].level = Math.floor(users[index].xp / 100) + 1;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[index];
    }
    return null;
  },

  // --- PERSISTENCE ---
  saveSession: (email: string, session: ChatSession) => {
    const normalizedEmail = email.toLowerCase();
    const allSessions = MockBackend.getAllSessions();
    const userSessions = allSessions[normalizedEmail] || [];
    const index = userSessions.findIndex(s => s.id === session.id);
    
    if (index > -1) {
      userSessions[index] = session;
    } else {
      userSessions.unshift(session);
    }
    
    allSessions[normalizedEmail] = userSessions;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions));
  },

  getUserSessions: (email: string): ChatSession[] => {
    const allSessions = MockBackend.getAllSessions();
    return allSessions[email.toLowerCase()] || [];
  },

  getAllSessions: (): Record<string, ChatSession[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : {};
  }
};
