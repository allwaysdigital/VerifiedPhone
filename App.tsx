/**
 * VerifiedPhone
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ShopDataProvider } from './src/context/ShopDataContext';
import { colors } from './src/theme/colors';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />
      <ShopDataProvider>
        <RootNavigator />
      </ShopDataProvider>
    </SafeAreaProvider>
  );
}

export default App;
