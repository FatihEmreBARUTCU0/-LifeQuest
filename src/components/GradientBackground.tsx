import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '../theme/colors';

type Props = ViewProps & { children: ReactNode };

export function GradientBackground({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.wrap, style]} {...rest}>
      <LinearGradient
        colors={[colors.bg, colors.bgElevated, colors.surface]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
