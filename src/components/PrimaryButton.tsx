import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = PressableProps & {
  title: string;
  emoji?: string;
  variant?: 'gold' | 'purple';
  containerStyle?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  title,
  emoji,
  variant = 'gold',
  containerStyle,
  disabled,
  ...rest
}: Props) {
  const grad =
    variant === 'gold'
      ? ([colors.goldDim, colors.gold, colors.goldBright] as const)
      : ([colors.purpleDark, colors.purple, colors.purpleLight] as const);
  const textStyle = [styles.text, variant === 'gold' ? styles.textOnGold : styles.textOnPurple];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        pressed && styles.pressed,
        disabled && styles.disabled,
        containerStyle,
      ]}
      {...rest}
    >
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        {emoji ? (
          <View style={styles.row}>
            <Text
              style={[
                styles.emoji,
                variant === 'gold' ? styles.emojiGoldVariant : styles.emojiPurpleVariant,
              ]}
            >
              {emoji}
            </Text>
            <Text style={textStyle}>{title}</Text>
          </View>
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  grad: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    maxWidth: '100%',
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  emojiGoldVariant: {
    color: colors.bg,
  },
  emojiPurpleVariant: {
    color: colors.text,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  textOnGold: {
    color: colors.bg,
  },
  textOnPurple: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
