import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Mood, PersistedState, Quest, QuestCategory, QuestDifficulty, QuestPriority } from '../types';

const STORAGE_KEY = '@lifequest/state_v1';

export const defaultPersistedState: PersistedState = {
  quests: [],
  profile: {
    totalXp: 0,
    streak: 0,
    lastActiveDate: null,
    questsCompletedCount: 0,
  },
  moodByDate: {},
};

const CATEGORIES: QuestCategory[] = ['work', 'education', 'health', 'home', 'personal'];
const DIFFICULTIES: QuestDifficulty[] = ['easy', 'medium', 'hard'];
const PRIORITIES: QuestPriority[] = ['urgent', 'normal', 'low'];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function normalizeQuest(raw: unknown): Quest | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : null;
  if (!id) return null;

  let title = '';
  if (typeof raw.title === 'string') {
    title = raw.title;
  } else if (typeof raw.name === 'string') {
    title = raw.name;
  }
  if (typeof title !== 'string') title = '';

  const category = CATEGORIES.includes(raw.category as QuestCategory)
    ? (raw.category as QuestCategory)
    : 'personal';
  const difficulty = DIFFICULTIES.includes(raw.difficulty as QuestDifficulty)
    ? (raw.difficulty as QuestDifficulty)
    : 'medium';
  const priority = PRIORITIES.includes(raw.priority as QuestPriority)
    ? (raw.priority as QuestPriority)
    : 'normal';

  const completed = raw.completed === true;
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  const completedAt = typeof raw.completedAt === 'string' ? raw.completedAt : undefined;

  return {
    id,
    title,
    category,
    difficulty,
    priority,
    completed,
    createdAt,
    completedAt,
  };
}

export async function loadPersistedState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultPersistedState, moodByDate: { ...defaultPersistedState.moodByDate } };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const rawQuests = Array.isArray(parsed.quests) ? parsed.quests : [];
    const quests = rawQuests
      .map((q) => normalizeQuest(q))
      .filter((q): q is Quest => q !== null);

    return {
      quests,
      profile: {
        totalXp: typeof parsed.profile?.totalXp === 'number' ? parsed.profile.totalXp : 0,
        streak: typeof parsed.profile?.streak === 'number' ? parsed.profile.streak : 0,
        lastActiveDate:
          typeof parsed.profile?.lastActiveDate === 'string'
            ? parsed.profile.lastActiveDate
            : null,
        questsCompletedCount:
          typeof parsed.profile?.questsCompletedCount === 'number'
            ? parsed.profile.questsCompletedCount
            : 0,
      },
      moodByDate:
        parsed.moodByDate && typeof parsed.moodByDate === 'object'
          ? (parsed.moodByDate as Record<string, Mood>)
          : {},
    };
  } catch {
    return { ...defaultPersistedState, moodByDate: { ...defaultPersistedState.moodByDate } };
  }
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  try {
    const payload: PersistedState = {
      quests: state.quests,
      profile: state.profile,
      moodByDate: state.moodByDate,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore persist errors */
  }
}
