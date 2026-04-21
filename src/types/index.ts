
export type Language = 'en' | 'ru' | 'uz';
export type StudentClass = '7A' | '7B' | '8A' | '8B' | '9A' | '9B' | '10A' | '10B' | '11A' | '11B';
export type AIModelType = 'teacher' | 'coach' | 'trainer' | 'genius';

export interface Attachment {
  mimeType: string;
  data: string; // base64
  name: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: Attachment;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number;
  photoURL?: string;
  bio?: string;
  interests: string[];
  studentClass: StudentClass;
  language: Language;
  xp: number;
  level: number;
  role: 'student' | 'admin';
  theme: 'light' | 'dark';
  geniusMode?: boolean;
  learningDepth?: 'Surface' | 'Deep' | 'Architect';
  explanationStyle?: 'Metaphorical' | 'Technical' | 'Simple';
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  type: AIModelType;
  messages: Message[];
  lastUpdated: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  timestamp: number;
}

export interface Article {
  id: string;
  subject: 'Physics' | 'Algebra' | 'English' | 'Biology' | 'Chemistry' | 'History';
  title: string;
  content: string;
  author: string;
  icon: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Challenge';
  status: 'pending' | 'completed';
  xpReward: number;
  createdAt: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  description: string;
  metaphor: string;
  challenge: string;
  points?: number;
  type: 'core' | 'branch' | 'leaf';
  completed?: boolean;
}

export interface KnowledgeTree {
  topic: string;
  nodes: KnowledgeNode[];
  connections: { from: string; to: string }[];
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'learning' | 'thinking' | 'education' | 'science';
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  likes: string[]; // array of uids
  commentsCount: number;
  createdAt: number;
  attachment?: Attachment;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface DirectMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  attachment?: Attachment;
}

export interface ChatThread {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantNames: Record<string, string>;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount?: Record<string, number>;
}
