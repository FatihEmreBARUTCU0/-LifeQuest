import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { CATEGORY_EMOJI } from '../constants/questUi';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { QuestCategory, QuestDifficulty } from '../types';
import { inferPriority } from '../utils/priority';

type Props = NativeStackScreenProps<RootStackParamList, 'AddQuest'>;

const categories = Object.keys(CATEGORY_EMOJI) as QuestCategory[];
const difficulties: QuestDifficulty[] = ['easy', 'medium', 'hard'];

export function AddQuestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addQuest } = useApp();
  const { t, locale, categoryLabel, difficultyLabel, priorityLabel } = useI18n();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QuestCategory>('personal');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [busy, setBusy] = useState(false);

  const previewPriority = inferPriority(title, locale);

  const submit = async () => {
    const tTrim = title.trim();
    if (!tTrim || busy) return;
    setBusy(true);
    try {
      await addQuest({ title: tTrim, category, difficulty });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <GradientBackground style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('addQuestTitleLabel')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('addQuestPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.hint}>
          {t('addQuestHint')} {priorityLabel(previewPriority)}
        </Text>

        <Text style={[styles.label, styles.mt]}>{t('addQuestCategory')}</Text>
        <View style={styles.chips}>
          {categories.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipOn]}
              >
                <View style={styles.chipInner}>
                  <Text style={styles.chipEmoji} allowFontScaling={false}>
                    {CATEGORY_EMOJI[c]}
                  </Text>
                  <Text style={[styles.chipLabel, active && styles.chipLabelOn]} numberOfLines={2}>
                    {categoryLabel(c)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, styles.mt]}>{t('addQuestDifficulty')}</Text>
        <View style={styles.chips}>
          {difficulties.map((d) => {
            const active = difficulty === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={[styles.chip, active && styles.chipOn]}
              >
                <Text style={[styles.chipText, active && styles.chipTextOn]}>
                  {difficultyLabel(d)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          title={busy ? t('addQuestSubmitBusy') : t('addQuestSubmit')}
          onPress={submit}
          disabled={busy || !title.trim()}
          containerStyle={styles.submit}
        />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  label: {
    color: colors.gold,
    fontWeight: '800',
    marginBottom: 8,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  mt: {
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  hint: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: '100%',
  },
  chipOn: {
    borderColor: colors.purpleLight,
    backgroundColor: colors.surface2,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  chipLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
    minWidth: 48,
  },
  chipLabelOn: {
    color: colors.text,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextOn: {
    color: colors.text,
  },
  submit: {
    marginTop: 28,
  },
});
