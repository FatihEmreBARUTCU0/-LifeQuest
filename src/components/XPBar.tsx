import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme/colors';
import { getLevelTier, tierBarInfo } from '../utils/xp';

const MIN_FILL_PX = 8;

type Props = { totalXp: number };

export function XPBar({ totalXp }: Props) {
  const { t, tierLabel } = useI18n();
  const tier = getLevelTier(totalXp);
  const { into, tierRange, isLegend, fraction } = tierBarInfo(totalXp);
  const [trackW, setTrackW] = useState(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width);
  };

  const fillPx =
    trackW > 0
      ? fraction <= 0
        ? 0
        : Math.max(MIN_FILL_PX, Math.round(fraction * trackW))
      : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{t('xpLabel')}</Text>
        <Text style={styles.value}>
          {totalXp} · {tierLabel(tier)}
        </Text>
      </View>
      <View style={styles.track} onLayout={onTrackLayout}>
        {trackW > 0 && fraction > 0 ? (
          <View style={[styles.fill, { width: Math.min(fillPx, trackW) }]} />
        ) : null}
      </View>
      {!isLegend ? (
        <Text style={styles.hint}>{t('xpHintNext', { into, span: tierRange })}</Text>
      ) : (
        <Text style={styles.hint}>{t('xpHintMax')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.2,
  },
  value: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.purpleLight,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
