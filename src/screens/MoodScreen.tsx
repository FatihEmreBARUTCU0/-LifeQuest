import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { GradientBackground } from '../components/GradientBackground';
import { MOOD_EMOJI, MOOD_ORDER } from '../constants/questUi';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { Mood } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Mood'>;

export function MoodScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setMoodForToday } = useApp();
  const { t, moodLabel } = useI18n();

  const pick = async (m: Mood) => {
    await setMoodForToday(m);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <GradientBackground style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 12 }}>
      <View style={styles.inner}>
        <Text style={styles.kicker}>{t('moodKicker')}</Text>
        <Text style={styles.title}>{t('moodTitle')}</Text>
        <Text style={styles.sub}>{t('moodSub')}</Text>

        <View style={styles.grid}>
          {MOOD_ORDER.map((id) => (
            <View key={id} style={styles.row}>
              <PrimaryButton
                emoji={MOOD_EMOJI[id]}
                title={moodLabel(id)}
                variant="purple"
                onPress={() => pick(id)}
                containerStyle={styles.btn}
              />
            </View>
          ))}
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  kicker: {
    color: colors.gold,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  grid: {
    gap: 12,
  },
  row: {},
  btn: {
    width: '100%',
  },
});
