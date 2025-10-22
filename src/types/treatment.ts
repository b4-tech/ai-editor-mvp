export type ToneType = 'DIRECT' | 'CONVERSATIONAL' | 'FUNNY' | 'POETIC';

export type GenreType = 
  | 'CARS' 
  | 'TECH' 
  | 'SPORTS' 
  | 'FASHION' 
  | 'BEAUTY' 
  | 'LIFESTYLE' 
  | 'FOOD' 
  | 'TRAVEL'
  | 'LUXURY'
  | 'HEALTHCARE'
  | 'FINANCE'
  | 'OTHER';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  alternativeTitles?: string[];
  wordCountLimit?: number;
  isCustom: boolean;
  order: number;
}

export interface CreativeModes {
  tighten: boolean;
  quips: boolean;
  curveball: boolean;
}

export interface TreatmentSettings {
  tone: ToneType;
  genre: GenreType;
  styleEmulation?: string;
  brief?: string;
  notes?: string;
  chemistryCallNotes?: string;
  reelLinks: string[];
  wordCountLimits: Record<string, number>;
  additionalPrompts?: string;
  toplineMode: boolean;
  naturalizeText: boolean;
  creativeModes: CreativeModes;
  enableScriptIdeas: boolean;
  enableCharacterBios: boolean;
  enableReferences: boolean;
  enableBonusOutputs: boolean;
}

export interface Version {
  id: string;
  treatmentId: string;
  content: string;
  timestamp: Date;
  chapters: Chapter[];
}

export interface Treatment {
  id: string;
  title: string;
  chapters: Chapter[];
  settings: TreatmentSettings;
  versions: Version[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BonusOutput {
  type: 'playlist' | 'watchlist' | 'moodboard';
  title: string;
  items: string[];
}

export interface CharacterBio {
  name: string;
  description: string;
  traits: string[];
  background: string;
}

export interface Reference {
  title: string;
  type: 'film' | 'tv' | 'commercial';
  rationale: string;
}

export interface ScriptIdea {
  sceneNumber: number;
  description: string;
  dialogue?: string;
  alternativeApproach?: string;
}

export interface GeneratedExtras {
  characterBios?: CharacterBio[];
  references?: Reference[];
  scriptIdeas?: ScriptIdea[];
  bonusOutputs?: BonusOutput[];
}

export const DEFAULT_CHAPTERS = [
  'INTRO',
  'APPROACH',
  'TONE',
  'CASTING',
  'PERFORMANCE',
  'CAMERA',
  'LOOK & FEEL',
  'EDIT',
  'MUSIC',
  'SOUND',
  'SCRIPTS',
  'CONCLUSION',
] as const;

export const DEFAULT_SETTINGS: TreatmentSettings = {
  tone: 'CONVERSATIONAL',
  genre: 'OTHER',
  reelLinks: [],
  wordCountLimits: {},
  toplineMode: false,
  naturalizeText: true,
  creativeModes: {
    tighten: false,
    quips: false,
    curveball: false,
  },
  enableScriptIdeas: false,
  enableCharacterBios: false,
  enableReferences: false,
  enableBonusOutputs: false,
};

