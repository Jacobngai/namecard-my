// CRITICAL: Must be imported FIRST for gesture handling on iOS 18+
import 'react-native-gesture-handler';

// CRITICAL: Must be imported for UUID generation on React Native
import 'react-native-get-random-values';

// Enable native screens for better performance and iOS 18+ compatibility
import { enableScreens } from 'react-native-screens';
enableScreens(true);

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
