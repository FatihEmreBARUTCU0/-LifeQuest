import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { colors } from '../theme/colors';
import type {
  Mood,
  PersistedState,
  PomodoroSession,
  Quest,
  QuestCategory,
  QuestDifficulty,
} from '../types';
import { useI18n } from '../i18n/I18nContext';
import { removeAsyncStorageKeysWithPrefix } from '../storage/clearAppStorage';
import { defaultPersistedState, loadPersistedState, savePersistedState } from '../storage/persist';
import { loadPomodoroMinutes, savePomodoroMinutes } from '../storage/pomodoroPref';
import { todayYmd } from '../utils/date';
import { inferPriority } from '../utils/priority';
import { nextStreakAfterActivity } from '../utils/streak';
import { xpForDifficulty } from '../utils/xp';

function newQuestId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

type AppContextValue = {
  needsDailyMood: boolean;
  persisted: PersistedState;
  pomodoro: PomodoroSession | null;
  pomodoroRemainingSec: number;
  preferredPomodoroMinutes: number;
  celebration: boolean;
  setMoodForToday: (mood: Mood) => Promise<void>;
  addQuest: (input: {
    title: string;
    difficulty: QuestDifficulty;
    category: QuestCategory;
  }) => Promise<void>;
  updateQuest: (input: {
    id: string;
    title: string;
    category: QuestCategory;
  }) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  startPomodoro: (questId: string, durationMinutes: number) => void;
  clearPomodoro: () => void;
  applyPomodoroPreference: (minutes: number) => Promise<void>;
  reloadFromStorage: () => Promise<void>;
  resetAllData: () => Promise<void>;
  dismissCelebration: () => void;
  sortedActiveQuests: Quest[];
  todayMood: Mood | null;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const i18n = useI18n();
  const { locale } = i18n;
  const tRef = useRef(i18n.t);
  tRef.current = i18n.t;

  const [hydrated, setHydrated] = useState(false);
  const [persisted, setPersisted] = useState<PersistedState | null>(null);
  const [pomodoro, setPomodoro] = useState<PomodoroSession | null>(null);
  const [pomodoroRemainingSec, setPomodoroRemainingSec] = useState(0);
  const [preferredPomodoroMinutes, setPreferredPomodoroMinutes] = useState(25);
  const [celebration, setCelebration] = useState(false);
  const [dayTick, setDayTick] = useState(0);

  const completeQuestRef = useRef<(id: string) => Promise<void>>(async () => {});

  useEffect(() => {
    const id = setInterval(() => setDayTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, mins] = await Promise.all([loadPersistedState(), loadPomodoroMinutes()]);
        if (cancelled) return;
        setPersisted(data);
        setPreferredPomodoroMinutes(mins);
      } catch {
        if (cancelled) return;
        setPersisted({
          ...defaultPersistedState,
          moodByDate: { ...defaultPersistedState.moodByDate },
        });
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: PersistedState) => {
    setPersisted(next);
    await savePersistedState(next);
  }, []);

  const reloadFromStorage = useCallback(async () => {
    try {
      const data = await loadPersistedState();
      setPersisted(data);
    } catch {
      /* ignore */
    }
    try {
      const mins = await loadPomodoroMinutes();
      setPreferredPomodoroMinutes(mins);
    } catch {
      /* ignore */
    }
  }, []);

  const resetAllData = useCallback(async () => {
    await removeAsyncStorageKeysWithPrefix('@lq/');
    await removeAsyncStorageKeysWithPrefix('@lifequest/');
    setPomodoro(null);
    setPomodoroRemainingSec(0);
    setCelebration(false);
    setPreferredPomodoroMinutes(25);
    setPersisted({
      ...defaultPersistedState,
      moodByDate: { ...defaultPersistedState.moodByDate },
    });
  }, []);

  const applyPomodoroPreference = useCallback(async (minutes: number) => {
    const clamped = Math.min(120, Math.max(1, Math.round(minutes)));
    setPreferredPomodoroMinutes(clamped);
    await savePomodoroMinutes(clamped);
  }, []);

  useEffect(() => {
    if (!pomodoro) {
      setPomodoroRemainingSec(0);
      return;
    }
    const { questId, endMs } = pomodoro;
    let finished = false;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      setPomodoroRemainingSec(left);
      if (left <= 0 && !finished) {
        finished = true;
        setPomodoro(null);
        setPomodoroRemainingSec(0);
        queueMicrotask(() => {
          Alert.alert(
            tRef.current('pomodoroDoneTitle'),
            tRef.current('pomodoroDoneMessage'),
            [
              { text: tRef.current('pomodoroDoneNo'), style: 'cancel' },
              {
                text: tRef.current('pomodoroDoneYes'),
                onPress: () => void completeQuestRef.current(questId),
              },
            ],
          );
        });
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [pomodoro]);

  void dayTick;
  const today = todayYmd();
  const needsDailyMood = hydrated && persisted ? persisted.moodByDate[today] === undefined : false;
  const todayMood = persisted?.moodByDate[today] ?? null;

  const sortedActiveQuests = useMemo(() => {
    if (!persisted) return [];
    const priorityRank = { urgent: 0, normal: 1, low: 2 };
    return persisted.quests
      .filter((q) => !q.completed)
      .sort((a, b) => {
        const pr = priorityRank[a.priority] - priorityRank[b.priority];
        if (pr !== 0) return pr;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [persisted]);

  const setMoodForToday = useCallback(
    async (mood: Mood) => {
      if (!persisted) return;
      const next: PersistedState = {
        ...persisted,
        moodByDate: { ...persisted.moodByDate, [todayYmd()]: mood },
      };
      await persist(next);
    },
    [persist, persisted],
  );

  const addQuest = useCallback(
    async (input: { title: string; difficulty: QuestDifficulty; category: QuestCategory }) => {
      if (!persisted) return;
      const title = input.title.trim();
      if (!title) return;
      const quest: Quest = {
        id: newQuestId(),
        title,
        category: input.category,
        difficulty: input.difficulty,
        priority: inferPriority(title, locale),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const next: PersistedState = { ...persisted, quests: [quest, ...persisted.quests] };
      await persist(next);
    },
    [locale, persist, persisted],
  );

  const updateQuest = useCallback(
    async (input: { id: string; title: string; category: QuestCategory }) => {
      if (!persisted) return;
      const title = input.title.trim();
      if (!title) return;
      const exists = persisted.quests.some((x) => x.id === input.id && !x.completed);
      if (!exists) return;
      const nextQuests = persisted.quests.map((x) =>
        x.id === input.id && !x.completed
          ? {
              ...x,
              title,
              category: input.category,
              priority: inferPriority(title, locale),
            }
          : x,
      );
      await persist({ ...persisted, quests: nextQuests });
    },
    [locale, persist, persisted],
  );

  const completeQuest = useCallback(
    async (id: string) => {
      if (!persisted) return;
      const q = persisted.quests.find((x) => x.id === id);
      if (!q || q.completed) return;
      const xpGain = xpForDifficulty(q.difficulty);
      const streakUp = nextStreakAfterActivity(
        persisted.profile.lastActiveDate,
        persisted.profile.streak,
      );
      const nextQuests = persisted.quests.map((x) =>
        x.id === id
          ? { ...x, completed: true, completedAt: new Date().toISOString() }
          : x,
      );
      const next: PersistedState = {
        ...persisted,
        quests: nextQuests,
        profile: {
          ...persisted.profile,
          totalXp: persisted.profile.totalXp + xpGain,
          streak: streakUp.streak,
          lastActiveDate: streakUp.lastActiveDate,
          questsCompletedCount: persisted.profile.questsCompletedCount + 1,
        },
      };
      await persist(next);
      setCelebration(true);
      setPomodoro((p) => (p?.questId === id ? null : p));
    },
    [persist, persisted],
  );

  completeQuestRef.current = completeQuest;

  const deleteQuest = useCallback(
    async (id: string) => {
      if (!persisted) return;
      const next: PersistedState = {
        ...persisted,
        quests: persisted.quests.filter((x) => x.id !== id),
      };
      await persist(next);
      setPomodoro((p) => (p?.questId === id ? null : p));
    },
    [persist, persisted],
  );

  const startPomodoro = useCallback((questId: string, durationMinutes: number) => {
    const m = Math.min(120, Math.max(1, Math.round(durationMinutes)));
    const durationSec = m * 60;
    setPomodoro({
      questId,
      endMs: Date.now() + durationSec * 1000,
      durationSec,
    });
  }, []);

  const clearPomodoro = useCallback(() => {
    setPomodoro(null);
    setPomodoroRemainingSec(0);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(false);
  }, []);

  const value = useMemo<AppContextValue | null>(() => {
    if (!persisted) return null;
    return {
      needsDailyMood,
      persisted,
      pomodoro,
      pomodoroRemainingSec,
      preferredPomodoroMinutes,
      celebration,
      setMoodForToday,
      addQuest,
      updateQuest,
      completeQuest,
      deleteQuest,
      startPomodoro,
      clearPomodoro,
      applyPomodoroPreference,
      reloadFromStorage,
      resetAllData,
      dismissCelebration,
      sortedActiveQuests,
      todayMood,
    };
  }, [
    addQuest,
    applyPomodoroPreference,
    celebration,
    completeQuest,
    deleteQuest,
    dismissCelebration,
    needsDailyMood,
    persisted,
    pomodoro,
    pomodoroRemainingSec,
    preferredPomodoroMinutes,
    reloadFromStorage,
    resetAllData,
    setMoodForToday,
    sortedActiveQuests,
    startPomodoro,
    clearPomodoro,
    todayMood,
    updateQuest,
  ]);

  if (!hydrated || !value) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
