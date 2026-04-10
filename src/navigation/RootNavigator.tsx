import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddQuestScreen } from '../screens/AddQuestScreen';
import { EditQuestScreen } from '../screens/EditQuestScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MoodScreen } from '../screens/MoodScreen';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.gold,
  },
};

export function RootNavigator() {
  const { needsDailyMood } = useApp();
  const { t } = useI18n();

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={needsDailyMood ? 'Mood' : 'Home'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgElevated },
          headerTintColor: colors.gold,
          headerTitleStyle: { fontWeight: '800', color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name="Mood"
          component={MoodScreen}
          options={{
            title: t('screenMoodTitle'),
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="AddQuest"
          component={AddQuestScreen}
          options={{ title: t('screenAddQuestTitle') }}
        />
        <Stack.Screen
          name="EditQuest"
          component={EditQuestScreen}
          options={{ title: t('screenEditQuestTitle') }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: t('screenProfileTitle') }}
        />
        <Stack.Screen
          name="Archive"
          component={ArchiveScreen}
          options={{ title: t('screenArchiveTitle') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
