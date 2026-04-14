
import { KnowledgeTree, UserProfile, KnowledgeNode } from "../types";

/**
 * THINKFLOW HEURISTIC ENGINE v1.0
 * A local, rule-based AI engine that generates knowledge structures
 * without external API dependencies.
 */

const METAPHOR_MAP: Record<string, Record<string, string[]>> = {
  "Gaming": {
    "core": ["The Game Engine", "Source Code", "Level 0: Tutorial"],
    "branch": ["Inventory Management", "Skill Tree Progression", "NPC Interaction", "Side Quests"],
    "leaf": ["Final Boss Strategy", "Speedrun Techniques", "Easter Eggs"]
  },
  "Cooking": {
    "core": ["The Base Recipe", "Kitchen Essentials", "Mise en Place"],
    "branch": ["Seasoning Balance", "Heat Control", "Plating Techniques", "Flavor Profiles"],
    "leaf": ["Signature Dish", "Molecular Gastronomy", "Chef's Special"]
  },
  "Sports": {
    "core": ["The Training Camp", "Basic Drills", "The Rulebook"],
    "branch": ["Player Stats", "Team Tactics", "Offensive Plays", "Defensive Strategy"],
    "leaf": ["Championship Finals", "MVP Performance", "Post-game Analysis"]
  },
  "Music": {
    "core": ["The Rhythm Section", "Music Theory 101", "The Scale"],
    "branch": ["Chord Progressions", "Melodic Hooks", "Harmony Layers", "Tempo Control"],
    "leaf": ["Symphonic Arrangement", "Solo Improvisation", "Studio Production"]
  }
};

const DEFAULT_METAPHOR = {
  "core": ["The Foundation", "The Blueprint", "The Core"],
  "branch": ["The Structure", "The Logic", "The Flow", "The Connection"],
  "leaf": ["The Result", "The Mastery", "The Application"]
};

export const generateLocalKnowledgeTree = (topic: string, profile: UserProfile): KnowledgeTree => {
  console.log("[LOCAL-ENGINE] Synthesizing knowledge for:", topic);

  // Normalize topic (simple fix for common typos)
  const normalizedTopic = topic.replace(/фуекци/gi, 'функци').replace(/линейн/gi, 'Линейн');
  
  const interest = profile.interests[0] || "General";
  const metaphorSet = METAPHOR_MAP[interest] || DEFAULT_METAPHOR;
  
  const nodeCount = 5;
  const nodes: KnowledgeNode[] = [];

  const stageNames = [
    { label: "Введение в", desc: "Разбираем фундаментальные основы. Это база, без которой невозможно двигаться дальше." },
    { label: "Механика и структура", desc: "Как устроены внутренние процессы? Изучаем ключевые переменные и их взаимодействие." },
    { label: "Логические связи", desc: "Анализируем, как отдельные части соединяются в единую систему." },
    { label: "Практическое применение", desc: "Переходим к реальным кейсам. Как использовать эти знания на практике?" },
    { label: "Продвинутое мастерство", desc: "Выходим за рамки стандартов. Создаем инновационные решения на основе изученного." }
  ];

  for (let i = 1; i <= nodeCount; i++) {
    let type: 'core' | 'branch' | 'leaf' = 'branch';
    if (i === 1) type = 'core';
    if (i === nodeCount) type = 'leaf';

    const stage = stageNames[i-1];
    const metaphors = metaphorSet[type];
    const metaphor = metaphors[Math.floor(Math.random() * metaphors.length)];

    nodes.push({
      id: i.toString(),
      label: `${stage.label} ${normalizedTopic}`,
      description: `${normalizedTopic} на этом этапе требует понимания ${type === 'core' ? 'базовых определений' : type === 'branch' ? 'взаимосвязей элементов' : 'комплексного синтеза'}. ${stage.desc}`,
      metaphor: `Представь, что это — ${metaphor}. В контексте ${interest} это критически важно для достижения результата.`,
      challenge: `Испытание ${i}: Примени логику ${normalizedTopic} для оптимизации процесса в сфере ${interest}.`,
      type
    });
  }

  const connections = [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "4", to: "5" }
  ];

  return {
    topic: normalizedTopic,
    nodes,
    connections
  };
};

export const getLocalChatResponse = (prompt: string, profile: UserProfile): string => {
  const lang = profile.language === 'ru' ? 'RU' : 'EN';
  
  const responses: Record<string, string> = {
    "RU": `Я — локальное ядро ThinkFlow. Мой API-ключ сейчас не активен, но я все равно могу помочь тебе! Ты спросил про "${prompt}". Давай разберем это через твои интересы: ${profile.interests.join(', ')}.`,
    "EN": `I am the ThinkFlow Local Core. My API key is currently inactive, but I can still help you! You asked about "${prompt}". Let's break it down using your interests: ${profile.interests.join(', ')}.`
  };

  return responses[lang];
};
