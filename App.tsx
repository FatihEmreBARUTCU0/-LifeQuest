import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import { I18nProvider } from './src/i18n/I18nContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <I18nProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </I18nProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
