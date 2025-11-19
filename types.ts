
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export type Difficulty = 'Leicht' | 'Mittel' | 'Schwer';
export type Language = 'de' | 'en' | 'es';

export interface UserProgress {
  playerLevel: number;
  xp: number;
  coins: number; // New: Currency
  highestLevelUnlocked: number;
  unlockedGates: number[]; // New: Tracks paid levels (Level 6, 11, etc.)
  askedQuestions: string[];
  username?: string;
  avatarId?: string;
  lastDailyChallengePlayed?: string; // Format: YYYY-MM-DD
}

export interface AppSettings {
  volume: number;
  language: Language;
}