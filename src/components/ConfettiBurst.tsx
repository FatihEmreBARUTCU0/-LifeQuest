import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const PARTICLES = ['✨', '⭐', '💫', '✦', '·'];

type Props = { active: boolean };

export function ConfettiBurst({ active }: Props) {
  const anims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) {
      anims.forEach((a) => a.setValue(0));
      return;
    }
    const loops = anims.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 900 + i * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    Animated.stagger(40, loops).start();
  }, [active, anims]);

  if (!active) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {PARTICLES.map((ch, i) => {
        const t = anims[i];
        const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -120 - i * 10] });
        const translateX = t.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 6)],
        });
        const opacity = t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });
        const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });
        return (
          <Animated.Text
            key={ch + String(i)}
            style={[
              styles.particle,
              {
                left: `${12 + i * 16}%`,
                top: `${36 + (i % 3) * 8}%`,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          >
            {ch}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 22,
    color: colors.goldBright,
  },
});
