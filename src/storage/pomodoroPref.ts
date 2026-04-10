import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@lq/v1/pomodoroMinutes';

export async function loadPomodoroMinutes(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return 25;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1 || n > 120) return 25;
    return n;
  } catch {
    return 25;
  }
}

export async function savePomodoroMinutes(minutes: number): Promise<void> {
  try {
    const clamped = Math.min(120, Math.max(1, Math.round(minutes)));
    await AsyncStorage.setItem(KEY, String(clamped));
  } catch {
    /* ignore */
  }
}
