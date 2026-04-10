import type { Mood, QuestCategory } from '../types';

export const CATEGORY_EMOJI: Record<QuestCategory, string> = {
  work: '💼',
  education: '📚',
  health: '🏃',
  home: '🏠',
  personal: '⭐',
};

export const MOOD_ORDER: Mood[] = ['tired', 'normal', 'energetic', 'stressed', 'focused'];

export const MOOD_EMOJI: Record<Mood, string> = {
  tired: '😴',
  normal: '😊',
  energetic: '😤',
  stressed: '😰',
  focused: '🎯',
};
