import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Add Purchase / Add Sale collect enough data that losing it to an
// accidental hardware-back-press or edge-swipe is a real cost — this
// restricts leaving the screen to its explicit header back button only,
// for as long as the screen is focused.
export function useDisableBackNavigation() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ gestureEnabled: false });
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => {
        subscription.remove();
        navigation.setOptions({ gestureEnabled: true });
      };
    }, [navigation]),
  );
}
