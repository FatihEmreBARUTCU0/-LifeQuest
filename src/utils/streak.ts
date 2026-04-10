import { todayYmd, yesterdayYmd } from './date';

export function nextStreakAfterActivity(
  lastActiveDate: string | null,
  currentStreak: number,
): { streak: number; lastActiveDate: string } {
  const today = todayYmd();
  if (lastActiveDate === today) {
    return { streak: currentStreak, lastActiveDate: today };
  }
  if (!lastActiveDate) {
    return { streak: 1, lastActiveDate: today };
  }
  if (lastActiveDate === yesterdayYmd()) {
    return { streak: currentStreak + 1, lastActiveDate: today };
  }
  return { streak: 1, lastActiveDate: today };
}
