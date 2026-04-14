
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
  
  const nodes: KnowledgeNode[] = [
    {
      id: "1",
      label: `Foundations of ${topic}`,
      description: `Understanding the core principles and basic definitions of ${topic}. This is where everything starts.`,
      metaphor: `Think of this as ${metaphors.foundation}. Without a solid base, the rest cannot exist.`,
      challenge: `Explain the basic concept of ${topic} to a friend using a simple example.`,
      type: "core"
    },
    {
      id: "2",
      label: "Variables & Elements",
      description: `Identifying the individual components that make up ${topic}. How they change and interact.`,
      metaphor: `Each element here is like a ${metaphors.variable}. You can swap them, change them, and see how they affect the whole.`,
      challenge: `List 3 key elements of ${topic} and explain how they differ from each other.`,
      type: "branch"
    },
    {
      id: "3",
      label: "Process & Flow",
      description: `How ${topic} functions over time. The cycles and patterns that drive the system.`,
      metaphor: `This is the ${metaphors.loop}. It's a continuous movement that keeps the system alive.`,
      challenge: `Draw a diagram showing the 'flow' of ${topic} from start to finish.`,
      type: "branch"
    },
    {
      id: "4",
      label: "Advanced Logic",
      description: `Deep dive into the complex decision-making and rules that govern ${topic}.`,
      metaphor: `This is your ${metaphors.logic}. It's the brain of the operation, deciding what happens next.`,
      challenge: `Solve a complex problem related to ${topic} by applying the rules you've learned.`,
      type: "branch"
    },
    {
      id: "5",
      label: "Mastery Level",
      description: `The pinnacle of ${topic}. Combining everything to create something new or solve high-level problems.`,
      metaphor: `You are now facing the ${metaphors.advanced}. This requires all your skills combined.`,
      challenge: `Create a small project or presentation that demonstrates your complete understanding of ${topic}.`,
      type: "leaf"
    }
  ];

  const connections = [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "4", to: "5" }
  ];

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
