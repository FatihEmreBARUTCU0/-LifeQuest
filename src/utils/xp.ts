import type { QuestDifficulty } from '../types';

export type LevelTier = 'beginner' | 'explorer' | 'warrior' | 'legend';

export function xpForDifficulty(d: QuestDifficulty): number {
  switch (d) {
    case 'easy':
      return 10;
    case 'medium':
      return 25;
    case 'hard':
      return 50;
  }
}

export function getLevelTier(totalXp: number): LevelTier {
  if (totalXp < 100) return 'beginner';
  if (totalXp < 300) return 'explorer';
  if (totalXp < 600) return 'warrior';
  return 'legend';
}

/**
 * XP bar: progress within current tier.
 * Beginner 0–99 in [0,100), Explorer [100,300) range 200, Warrior [300,600) range 300, Legend full.
 */
export function tierBarInfo(totalXp: number): {
  tierStart: number;
  tierRange: number;
  into: number;
  isLegend: boolean;
  fraction: number;
} {
  if (totalXp >= 600) {
    return {
      tierStart: 600,
      tierRange: 1,
      into: totalXp - 600,
      isLegend: true,
      fraction: 1,
    };
  }
  if (totalXp >= 300) {
    const tierStart = 300;
    const tierRange = 300;
    const into = totalXp - tierStart;
    return {
      tierStart,
      tierRange,
      into,
      isLegend: false,
      fraction: Math.min(1, Math.max(0, into / tierRange)),
    };
  }
  if (totalXp >= 100) {
    const tierStart = 100;
    const tierRange = 200;
    const into = totalXp - tierStart;
    return {
      tierStart,
      tierRange,
      into,
      isLegend: false,
      fraction: Math.min(1, Math.max(0, into / tierRange)),
    };
  }
  const tierStart = 0;
  const tierRange = 100;
  const into = totalXp - tierStart;
  return {
    tierStart,
    tierRange,
    into,
    isLegend: false,
    fraction: Math.min(1, Math.max(0, into / tierRange)),
  };
}
