import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppLocale } from '../types/locale';
import type { Mood, QuestCategory, QuestDifficulty, QuestPriority } from '../types';
import type { LevelTier } from '../utils/xp';
import { catalogs, type MsgKey } from './messages';
import { loadSavedLocale, saveLocalePreference } from './localeStorage';

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => Promise<void>;
  /** After wiping AsyncStorage locale key; does not write storage. */
  resetLocaleAfterDataWipe: () => void;
  t: (key: MsgKey, vars?: Record<string, string | number>) => string;
  categoryLabel: (c: QuestCategory) => string;
  difficultyLabel: (d: QuestDifficulty) => string;
  priorityLabel: (p: QuestPriority) => string;
  moodLabel: (m: Mood) => string;
  moodSuggestion: (m: Mood) => string;
  tierLabel: (tier: LevelTier) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyVars(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('tr');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSavedLocale();
      if (cancelled) return;
      if (saved) setLocaleState(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (next: AppLocale) => {
    setLocaleState(next);
    await saveLocalePreference(next);
  }, []);

  const resetLocaleAfterDataWipe = useCallback(() => {
    setLocaleState('tr');
  }, []);

  const t = useCallback(
    (key: MsgKey, vars?: Record<string, string | number>) => {
      const template = catalogs[locale][key] ?? String(key);
      return applyVars(template, vars);
    },
    [locale],
  );

  const categoryLabel = useCallback(
    (c: QuestCategory) => {
      const map: Record<QuestCategory, MsgKey> = {
        work: 'catWork',
        education: 'catEducation',
        health: 'catHealth',
        home: 'catHome',
        personal: 'catPersonal',
      };
      return t(map[c]);
    },
    [t],
  );

  const difficultyLabel = useCallback(
    (d: QuestDifficulty) => {
      const map: Record<QuestDifficulty, MsgKey> = {
        easy: 'diffEasy',
        medium: 'diffMedium',
        hard: 'diffHard',
      };
      return t(map[d]);
    },
    [t],
  );

  const priorityLabel = useCallback(
    (p: QuestPriority) => {
      const map: Record<QuestPriority, MsgKey> = {
        urgent: 'priUrgent',
        normal: 'priNormal',
        low: 'priLow',
      };
      return t(map[p]);
    },
    [t],
  );

  const moodLabel = useCallback(
    (m: Mood) => {
      const map: Record<Mood, MsgKey> = {
        tired: 'moodLabelTired',
        normal: 'moodLabelNormal',
        energetic: 'moodLabelEnergetic',
        stressed: 'moodLabelStressed',
        focused: 'moodLabelFocused',
      };
      return t(map[m]);
    },
    [t],
  );

  const moodSuggestion = useCallback(
    (m: Mood) => {
      const map: Record<Mood, MsgKey> = {
        tired: 'moodSuggestionTired',
        normal: 'moodSuggestionNormal',
        energetic: 'moodSuggestionEnergetic',
        stressed: 'moodSuggestionStressed',
        focused: 'moodSuggestionFocused',
      };
      return t(map[m]);
    },
    [t],
  );

  const tierLabel = useCallback(
    (tier: LevelTier) => {
      const map: Record<LevelTier, MsgKey> = {
        beginner: 'tierBeginner',
        explorer: 'tierExplorer',
        warrior: 'tierWarrior',
        legend: 'tierLegend',
      };
      return t(map[tier]);
    },
    [t],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      resetLocaleAfterDataWipe,
      t,
      categoryLabel,
      difficultyLabel,
      priorityLabel,
      moodLabel,
      moodSuggestion,
      tierLabel,
    }),
    [
      categoryLabel,
      difficultyLabel,
      locale,
      moodLabel,
      moodSuggestion,
      priorityLabel,
      resetLocaleAfterDataWipe,
      setLocale,
      t,
      tierLabel,
    ],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
