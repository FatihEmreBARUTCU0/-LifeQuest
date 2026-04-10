import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLocale } from '../types/locale';

const LOCALE_KEY = '@lifequest/locale_v1';

export async function loadSavedLocale(): Promise<AppLocale | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCALE_KEY);
    if (raw === 'tr' || raw === 'en') return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveLocalePreference(locale: AppLocale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_KEY, locale);
}
