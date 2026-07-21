import { useCallback } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type BarStyle = 'dark-content' | 'light-content';

export function useScreenStatusBar(barStyle: BarStyle, backgroundColor: string) {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle, true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor, true);
      }
    }, [barStyle, backgroundColor]),
  );
}
