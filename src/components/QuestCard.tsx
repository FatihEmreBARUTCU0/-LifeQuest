import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Quest } from '../types';
import { CATEGORY_EMOJI } from '../constants/questUi';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme/colors';
import { formatMmSs } from '../utils/date';
import { xpForDifficulty } from '../utils/xp';

type Props = {
  quest: Quest;
  pomodoroActive: boolean;
  pomodoroRemainingSec: number;
  pomodoroTotalSec: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenPomodoroPicker: (id: string) => void;
  onStopPomodoro: () => void;
  onEdit: (id: string) => void;
};

export function QuestCard({
  quest,
  pomodoroActive,
  pomodoroRemainingSec,
  pomodoroTotalSec,
  onComplete,
  onDelete,
  onOpenPomodoroPicker,
  onStopPomodoro,
  onEdit,
}: Props) {
  const { t, categoryLabel, difficultyLabel, priorityLabel } = useI18n();
  const emoji = CATEGORY_EMOJI[quest.category];
  const catName = categoryLabel(quest.category);
  const diffName = difficultyLabel(quest.difficulty);
  const prName = priorityLabel(quest.priority);
  const xp = xpForDifficulty(quest.difficulty);

  const elapsed = pomodoroActive ? Math.max(0, pomodoroTotalSec - pomodoroRemainingSec) : 0;
  const progress = pomodoroActive && pomodoroTotalSec > 0 ? elapsed / pomodoroTotalSec : 0;

  const confirmDelete = () => {
    Alert.alert(t('alertDeleteTitle'), quest.title, [
      { text: t('alertCancel'), style: 'cancel' },
      { text: t('alertDeleteConfirm'), style: 'destructive', onPress: () => onDelete(quest.id) },
    ]);
  };

  return (
    <LinearGradient colors={[colors.surface, colors.surface2]} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.catBadge}>
          <Text style={styles.emojiGlyph} allowFontScaling={false}>
            {emoji}
          </Text>
          <Text style={styles.catLabel} numberOfLines={2}>
            {catName}
          </Text>
        </View>
        <View style={styles.topText}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {quest.title}
          </Text>
          <Text style={styles.meta}>
            {diffName} · {prName} · +{xp} XP
          </Text>
        </View>
      </View>

      {pomodoroActive ? (
        <View style={styles.pomodoroBlock}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <View style={styles.timerRow}>
            <Text style={styles.timerTimes}>
              {formatMmSs(pomodoroRemainingSec)} / {formatMmSs(pomodoroTotalSec)}
            </Text>
            <Pressable onPress={onStopPomodoro} style={({ pressed }) => [styles.stopBtn, pressed && styles.pressed]}>
              <Text style={styles.stopBtnText}>{t('pomodoroStop')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => onOpenPomodoroPicker(quest.id)}
          style={({ pressed }) => [styles.tomatoBtn, pressed && styles.pressed]}
          accessibilityLabel={t('pomodoroModalTitle')}
        >
          <Text style={styles.tomatoGlyph}>🍅</Text>
        </Pressable>
        <Pressable
          onPress={() => onComplete(quest.id)}
          style={({ pressed }) => [styles.primaryMini, pressed && styles.pressed]}
        >
          <Text style={styles.primaryMiniText}>{t('questComplete')}</Text>
        </Pressable>
        <Pressable
          onPress={() => onEdit(quest.id)}
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
        >
          <Text style={styles.editText}>{t('questEdit')}</Text>
        </Pressable>
        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [styles.trashBtn, pressed && styles.pressed]}
          accessibilityLabel={t('questDelete')}
        >
          <Text style={styles.trashGlyph}>🗑️</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 108,
  },
  emojiGlyph: {
    fontSize: 26,
    lineHeight: 30,
  },
  catLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.purpleLight,
    fontSize: 13,
    fontWeight: '800',
  },
  topText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pomodoroBlock: {
    marginTop: 10,
    gap: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.purpleDark,
  },
  timerTimes: {
    color: colors.goldBright,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    fontSize: 14,
    flex: 1,
  },
  stopBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stopBtnText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tomatoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  tomatoGlyph: {
    fontSize: 20,
  },
  primaryMini: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.purple,
  },
  primaryMiniText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.bgElevated,
  },
  editText: {
    color: colors.goldBright,
    fontWeight: '800',
    fontSize: 12,
  },
  trashBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  trashGlyph: {
    fontSize: 20,
  },
  pressed: {
    opacity: 0.85,
  },
});
