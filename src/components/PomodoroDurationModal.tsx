import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme/colors';

const PRESETS = [15, 25, 45, 60] as const;

type Props = {
  visible: boolean;
  defaultMinutes: number;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
};

export function PomodoroDurationModal({ visible, defaultMinutes, onClose, onConfirm }: Props) {
  const { t } = useI18n();
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState(String(defaultMinutes));

  useEffect(() => {
    if (visible) {
      setCustomOpen(false);
      setCustomText(String(defaultMinutes));
    }
  }, [visible, defaultMinutes]);

  const pick = (minutes: number) => {
    onConfirm(minutes);
    onClose();
  };

  const confirmCustom = () => {
    const n = parseInt(customText.replace(/\D/g, ''), 10);
    const clamped = Math.min(120, Math.max(1, Number.isFinite(n) ? n : defaultMinutes));
    pick(clamped);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{t('pomodoroModalTitle')}</Text>
            <View style={styles.presets}>
              {PRESETS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => pick(m)}
                  style={({ pressed }) => [styles.presetBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.presetText}>
                    {m === 15
                      ? t('pomodoro15')
                      : m === 25
                        ? t('pomodoro25')
                        : m === 45
                          ? t('pomodoro45')
                          : t('pomodoro60')}
                  </Text>
                </Pressable>
              ))}
            </View>
            {!customOpen ? (
              <Pressable
                onPress={() => setCustomOpen(true)}
                style={({ pressed }) => [styles.customToggle, pressed && styles.pressed]}
              >
                <Text style={styles.customToggleText}>{t('pomodoroCustom')}</Text>
              </Pressable>
            ) : (
              <View style={styles.customBlock}>
                <Text style={styles.customLabel}>{t('pomodoroCustomLabel')}</Text>
                <TextInput
                  value={customText}
                  onChangeText={setCustomText}
                  keyboardType="number-pad"
                  placeholder="1–120"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <View style={styles.customActions}>
                  <Pressable
                    onPress={() => setCustomOpen(false)}
                    style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
                  >
                    <Text style={styles.secondaryText}>{t('alertCancel')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmCustom}
                    style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryText}>{t('pomodoroStart')}</Text>
                  </Pressable>
                </View>
              </View>
            )}
            <Pressable onPress={onClose} style={({ pressed }) => [styles.closeRow, pressed && styles.pressed]}>
              <Text style={styles.closeText}>{t('pomodoroModalClose')}</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  kav: {
    width: '100%',
  },
  sheet: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.goldBright,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
    textAlign: 'center',
  },
  presets: {
    gap: 10,
  },
  presetBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.purpleDark,
    alignItems: 'center',
  },
  presetText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  customToggle: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  customToggleText: {
    color: colors.purpleLight,
    fontWeight: '800',
  },
  customBlock: {
    marginTop: 8,
    gap: 8,
  },
  customLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
  },
  customActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  secondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  primary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.gold,
  },
  primaryText: {
    color: colors.bg,
    fontWeight: '900',
  },
  closeRow: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
