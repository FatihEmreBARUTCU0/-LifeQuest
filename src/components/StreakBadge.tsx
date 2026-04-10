import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme/colors';

type Props = { streak: number };

export function StreakBadge({ streak }: Props) {
  const { t } = useI18n();
  return (
    <View style={styles.wrap}>
      <Text style={styles.fire} accessibilityLabel={t('streakTitle')}>
        🔥
      </Text>
      <View>
        <Text style={styles.title}>{t('streakTitle')}</Text>
        <Text style={styles.value}>{t('streakDays', { n: streak })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fire: {
    fontSize: 28,
  },
  title: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: colors.goldBright,
    fontSize: 18,
    fontWeight: '800',
  },
});
