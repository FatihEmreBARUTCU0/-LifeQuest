import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { XPBar } from '../components/XPBar';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getLevelTier } from '../utils/xp';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type Badge = { id: string; title: string; desc: string; unlocked: boolean };

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { persisted, reloadFromStorage, resetAllData } = useApp();
  const { t, tierLabel, locale, setLocale, resetLocaleAfterDataWipe } = useI18n();
  const { profile } = persisted;
  const tier = getLevelTier(profile.totalXp);

  const badges = useMemo((): Badge[] => {
    return [
      {
        id: 'first',
        title: t('badgeFirstTitle'),
        desc: t('badgeFirstDesc'),
        unlocked: profile.questsCompletedCount >= 1,
      },
      {
        id: 'hunter',
        title: t('badgeHunterTitle'),
        desc: t('badgeHunterDesc'),
        unlocked: profile.questsCompletedCount >= 10,
      },
      {
        id: 'fire',
        title: t('badgeFireTitle'),
        desc: t('badgeFireDesc'),
        unlocked: profile.streak >= 7,
      },
      {
        id: 'war',
        title: t('badgeWarTitle'),
        desc: t('badgeWarDesc'),
        unlocked: getLevelTier(profile.totalXp) === 'warrior' || getLevelTier(profile.totalXp) === 'legend',
      },
      {
        id: 'leg',
        title: t('badgeLegTitle'),
        desc: t('badgeLegDesc'),
        unlocked: profile.totalXp >= 600,
      },
    ];
  }, [profile.questsCompletedCount, profile.streak, profile.totalXp, t]);

  const activeQuests = persisted.quests.filter((q) => !q.completed).length;
  const doneQuests = persisted.quests.filter((q) => q.completed).length;

  useFocusEffect(
    useCallback(() => {
      void reloadFromStorage();
    }, [reloadFromStorage]),
  );

  const confirmResetData = () => {
    Alert.alert(t('profileResetTitle'), undefined, [
      { text: t('profileResetCancel'), style: 'cancel' },
      {
        text: t('profileResetConfirm'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await resetAllData();
            } catch {
              /* ignore */
            }
            resetLocaleAfterDataWipe();
            navigation.reset({ index: 0, routes: [{ name: 'Mood' }] });
          })();
        },
      },
    ]);
  };

  return (
    <GradientBackground style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hero}>{t('profileHero')}</Text>
        <Text style={styles.role}>{tierLabel(tier)}</Text>

        <View style={styles.block}>
          <XPBar totalXp={profile.totalXp} />
        </View>

        <Text style={styles.section}>{t('profileLangTitle')}</Text>
        <View style={styles.langRow}>
          <Pressable
            onPress={() => setLocale('tr')}
            style={[styles.langChip, locale === 'tr' && styles.langChipOn]}
          >
            <Text style={[styles.langChipText, locale === 'tr' && styles.langChipTextOn]}>
              🇹🇷 {t('profileLangTr')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale('en')}
            style={[styles.langChip, locale === 'en' && styles.langChipOn]}
          >
            <Text style={[styles.langChipText, locale === 'en' && styles.langChipTextOn]}>
              🇬🇧 {t('profileLangEn')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{profile.streak}</Text>
            <Text style={styles.statLbl}>{t('statStreak')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{profile.questsCompletedCount}</Text>
            <Text style={styles.statLbl}>{t('statCompleted')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{activeQuests}</Text>
            <Text style={styles.statLbl}>{t('statActive')}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Archive')}
            style={({ pressed }) => [styles.stat, styles.statPressable, pressed && styles.statPressed]}
          >
            <Text style={styles.statVal}>{doneQuests}</Text>
            <Text style={styles.statLbl}>{t('statArchived')}</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>{t('profileBadges')}</Text>
        <View style={styles.badgeGrid}>
          {badges.map((b) => (
            <View key={b.id} style={[styles.badge, !b.unlocked && styles.badgeLocked]}>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
              <Text style={styles.badgeState}>
                {b.unlocked ? t('badgeUnlocked') : t('badgeLocked')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.resetSection}>
          <Pressable
            onPress={confirmResetData}
            style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
            accessibilityRole="button"
          >
            <Text style={styles.resetBtnText}>{t('profileResetData')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  hero: {
    color: colors.gold,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 4,
  },
  role: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  block: {
    marginBottom: 16,
  },
  section: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  langChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langChipOn: {
    borderColor: colors.gold,
    backgroundColor: colors.surface2,
  },
  langChipText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  langChipTextOn: {
    color: colors.goldBright,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statPressable: {
    borderColor: colors.purpleDark,
  },
  statPressed: {
    opacity: 0.88,
  },
  statVal: {
    color: colors.goldBright,
    fontSize: 22,
    fontWeight: '900',
  },
  statLbl: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  badgeGrid: {
    gap: 10,
  },
  badge: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.purpleDark,
  },
  badgeLocked: {
    opacity: 0.45,
    borderColor: colors.border,
  },
  badgeTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  badgeDesc: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  badgeState: {
    marginTop: 8,
    color: colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  resetSection: {
    marginTop: 'auto',
    paddingTop: 28,
  },
  resetBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  resetBtnPressed: {
    opacity: 0.9,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
