import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { GradientBackground } from '../components/GradientBackground';
import { PomodoroDurationModal } from '../components/PomodoroDurationModal';
import { QuestCard } from '../components/QuestCard';
import { StreakBadge } from '../components/StreakBadge';
import { XPBar } from '../components/XPBar';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { Quest } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t, moodSuggestion } = useI18n();
  const {
    persisted,
    sortedActiveQuests,
    todayMood,
    pomodoro,
    pomodoroRemainingSec,
    completeQuest,
    deleteQuest,
    startPomodoro,
    clearPomodoro,
    applyPomodoroPreference,
    preferredPomodoroMinutes,
    celebration,
    dismissCelebration,
    needsDailyMood,
    reloadFromStorage,
  } = useApp();

  const [pomodoroPickerQuestId, setPomodoroPickerQuestId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reloadFromStorage();
    }, [reloadFromStorage]),
  );

  useFocusEffect(
    useCallback(() => {
      if (needsDailyMood) {
        navigation.navigate('Mood');
      }
    }, [needsDailyMood, navigation]),
  );

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => dismissCelebration(), 2400);
    return () => clearTimeout(timer);
  }, [celebration, dismissCelebration]);

  const suggestion =
    todayMood !== null ? moodSuggestion(todayMood) : t('homeTipNoMood');

  const onPomodoroDurationConfirm = async (minutes: number) => {
    const id = pomodoroPickerQuestId;
    setPomodoroPickerQuestId(null);
    if (!id) return;
    try {
      await applyPomodoroPreference(minutes);
    } catch {
      /* ignore */
    }
    startPomodoro(id, minutes);
  };

  const renderItem = ({ item }: { item: Quest }) => (
    <QuestCard
      quest={item}
      pomodoroActive={pomodoro?.questId === item.id}
      pomodoroRemainingSec={pomodoro?.questId === item.id ? pomodoroRemainingSec : 0}
      pomodoroTotalSec={
        pomodoro && pomodoro.questId === item.id ? pomodoro.durationSec : 0
      }
      onComplete={completeQuest}
      onDelete={deleteQuest}
      onOpenPomodoroPicker={setPomodoroPickerQuestId}
      onStopPomodoro={clearPomodoro}
      onEdit={(id) => navigation.navigate('EditQuest', { questId: id })}
    />
  );

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>LifeQuest</Text>
        <View style={styles.toolbar}>
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.toolBtn}>
            <Text style={styles.toolText}>{t('homeProfile')}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('AddQuest')} style={styles.toolGold}>
            <Text style={styles.toolGoldText}>{t('homeAddQuest')}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={sortedActiveQuests}
        keyExtractor={(q) => q.id}
        renderItem={renderItem}
        extraData={[pomodoro, pomodoroRemainingSec]}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
          paddingTop: 8,
        }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <XPBar totalXp={persisted.profile.totalXp} />
            <View style={styles.streakRow}>
              <StreakBadge streak={persisted.profile.streak} />
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipTitle}>{t('homeTipTitle')}</Text>
              <Text style={styles.tipBody}>{suggestion}</Text>
            </View>
            {sortedActiveQuests.length === 0 ? (
              <Text style={styles.empty}>{t('homeEmptyActive')}</Text>
            ) : null}
          </View>
        }
      />

      <PomodoroDurationModal
        visible={pomodoroPickerQuestId !== null}
        defaultMinutes={preferredPomodoroMinutes}
        onClose={() => setPomodoroPickerQuestId(null)}
        onConfirm={onPomodoroDurationConfirm}
      />

      <Modal visible={celebration} transparent animationType="fade">
        <View style={styles.modal}>
          <ConfettiBurst active={celebration} />
          <Text style={styles.modalTitle}>{t('modalQuestCompleteTitle')}</Text>
          <Text style={styles.modalSub}>{t('modalQuestCompleteSub')}</Text>
        </View>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
  },
  brand: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolText: {
    color: colors.text,
    fontWeight: '700',
  },
  toolGold: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.gold,
  },
  toolGoldText: {
    color: colors.bg,
    fontWeight: '900',
  },
  headerBlock: {
    marginBottom: 8,
    gap: 12,
  },
  streakRow: {
    flexDirection: 'row',
  },
  tip: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipTitle: {
    color: colors.gold,
    fontWeight: '800',
    marginBottom: 6,
    fontSize: 13,
  },
  tipBody: {
    color: colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(12,6,20,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalTitle: {
    color: colors.goldBright,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    zIndex: 60,
  },
  modalSub: {
    color: colors.textMuted,
    marginTop: 8,
    fontSize: 15,
    zIndex: 60,
  },
});
