import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Some screens collect enough data (Add Purchase, Add Sale), or gate
// something mandatory (Complete Profile), that leaving via an accidental
// hardware-back-press or edge-swipe is a real cost — this restricts
// leaving the screen to its explicit header back button (or an explicit
// in-screen action) only, for as long as it's focused.
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
