import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../components/GradientBackground';
import { CATEGORY_EMOJI } from '../constants/questUi';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { Quest } from '../types';
import { xpForDifficulty } from '../utils/xp';

type Props = NativeStackScreenProps<RootStackParamList, 'Archive'>;

function ArchiveRow({ quest }: { quest: Quest }) {
  const { categoryLabel, difficultyLabel, locale } = useI18n();
  const emoji = CATEGORY_EMOJI[quest.category];
  const xp = xpForDifficulty(quest.difficulty);
  const when = quest.completedAt
    ? new Date(quest.completedAt).toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <LinearGradient colors={[colors.surface, colors.surface2]} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji} allowFontScaling={false}>
          {emoji}
        </Text>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {quest.title}
          </Text>
          <Text style={styles.meta}>
            {categoryLabel(quest.category)} · {difficultyLabel(quest.difficulty)} · +{xp} XP
          </Text>
          <Text style={styles.date}>
            {when}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export function ArchiveScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { persisted, reloadFromStorage } = useApp();

  useFocusEffect(
    useCallback(() => {
      void reloadFromStorage();
    }, [reloadFromStorage]),
  );

  const completed = useMemo(() => {
    return persisted.quests
      .filter((q) => q.completed)
      .sort((a, b) => {
        const ta = a.completedAt ?? a.createdAt;
        const tb = b.completedAt ?? b.createdAt;
        return tb.localeCompare(ta);
      });
  }, [persisted.quests]);

  return (
    <GradientBackground style={{ paddingTop: insets.top, flex: 1 }}>
      <FlatList
        data={completed}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
          paddingTop: 12,
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('archiveEmpty')}</Text>
        }
        renderItem={({ item }) => <ArchiveRow quest={item} />}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: colors.goldDim,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
