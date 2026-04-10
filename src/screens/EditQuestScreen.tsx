import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
import type { QuestCategory } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditQuest'>;

const categories = Object.keys(CATEGORY_EMOJI) as QuestCategory[];

export function EditQuestScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { questId } = route.params;
  const { persisted, updateQuest } = useApp();
  const { t, categoryLabel } = useI18n();
  const quest = persisted.quests.find((q) => q.id === questId);

  const [title, setTitle] = useState(quest?.title ?? '');
  const [category, setCategory] = useState<QuestCategory>(quest?.category ?? 'personal');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!quest || quest.completed) {
      navigation.goBack();
      return;
    }
    setTitle(quest.title);
    setCategory(quest.category);
  }, [quest, navigation]);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed || !quest || quest.completed || busy) return;
    setBusy(true);
    try {
      await updateQuest({ id: quest.id, title: trimmed, category });
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  if (!quest || quest.completed) {
    return null;
  }

  return (
    <GradientBackground style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('editQuestTitleLabel')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('addQuestPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={[styles.label, styles.mt]}>{t('editQuestCategory')}</Text>
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

        <PrimaryButton
          title={busy ? t('editQuestSaving') : t('editQuestSave')}
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
  submit: {
    marginTop: 28,
  },
});
