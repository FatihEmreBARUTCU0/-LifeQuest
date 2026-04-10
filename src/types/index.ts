export type Mood = 'tired' | 'normal' | 'energetic' | 'stressed' | 'focused';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export type QuestCategory = 'work' | 'education' | 'health' | 'home' | 'personal';

export type QuestPriority = 'urgent' | 'normal' | 'low';

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  priority: QuestPriority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface UserProfile {
  totalXp: number;
  streak: number;
  lastActiveDate: string | null;
  questsCompletedCount: number;
}

export interface PersistedState {
  quests: Quest[];
  profile: UserProfile;
  moodByDate: Record<string, Mood>;
}

export interface PomodoroSession {
  questId: string;
  endMs: number;
  /** Total session length in seconds (for progress and MM:SS display). */
  durationSec: number;
}
