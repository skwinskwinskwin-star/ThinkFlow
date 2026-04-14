
import { KnowledgeTree, UserProfile, KnowledgeNode } from "../types";

/**
 * THINKFLOW HEURISTIC ENGINE v1.0
 * A local, rule-based AI engine that generates knowledge structures
 * without external API dependencies.
 */

const METAPHOR_MAP: Record<string, Record<string, string>> = {
  "Gaming": {
    "foundation": "The Game Engine",
    "variable": "Inventory Slot",
    "loop": "Respawn Cycle",
    "logic": "Skill Tree",
    "advanced": "Final Boss Mechanics"
  },
  "Cooking": {
    "foundation": "The Base Recipe",
    "variable": "Ingredient",
    "loop": "Stirring Process",
    "logic": "Taste Testing",
    "advanced": "Molecular Gastronomy"
  },
  "Sports": {
    "foundation": "The Training Camp",
    "variable": "Player Stats",
    "loop": "Practice Drills",
    "logic": "Game Strategy",
    "advanced": "Championship Finals"
  },
  "Music": {
    "foundation": "The Rhythm Section",
    "variable": "Musical Note",
    "loop": "Chorus Loop",
    "logic": "Composition Rules",
    "advanced": "Symphonic Arrangement"
  }
};

const DEFAULT_METAPHOR = {
  "foundation": "The Building Blocks",
  "variable": "Component",
  "loop": "Repeating Pattern",
  "logic": "Decision Path",
  "advanced": "Master Structure"
};

export const generateLocalKnowledgeTree = (topic: string, profile: UserProfile): KnowledgeTree => {
  console.log("[LOCAL-ENGINE] Synthesizing knowledge for:", topic);

  const interest = profile.interests[0] || "General";
  const metaphors = METAPHOR_MAP[interest] || DEFAULT_METAPHOR;
  
  // Dynamic structure generation to avoid "template" feel
  const nodeCount = 5 + Math.floor(Math.random() * 3); // 5 to 7 nodes
  const nodes: KnowledgeNode[] = [];

  const adjectives = ["Core", "Essential", "Fundamental", "Crucial", "Primary"];
  const actions = ["Mastering", "Exploring", "Decoding", "Analyzing", "Building"];

  for (let i = 1; i <= nodeCount; i++) {
    let type: 'core' | 'branch' | 'leaf' = 'branch';
    if (i === 1) type = 'core';
    if (i === nodeCount) type = 'leaf';

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const act = actions[Math.floor(Math.random() * actions.length)];

    nodes.push({
      id: i.toString(),
      label: i === 1 ? `${adj} ${topic}` : `${act} ${topic} Level ${i}`,
      description: `Deep dive into phase ${i} of ${topic}. This stage focuses on the ${type} aspects of the subject, ensuring a comprehensive understanding.`,
      metaphor: i === 1 ? `Think of this as ${metaphors.foundation}.` : `This is like ${metaphors.variable} in your ${interest} journey.`,
      challenge: `Challenge ${i}: Apply ${topic} to a real-world scenario involving ${interest}.`,
      type
    });
  }

  const connections = [];
  for (let i = 1; i < nodeCount; i++) {
    connections.push({ from: i.toString(), to: (i + 1).toString() });
  }

  return {
    topic,
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
