import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { subscribeToAuthState } from '../auth/session';
import { getMyShop } from '../api/shop';
import SplashBg from '../assets/splash_bg.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white, true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const unsubscribe = subscribeToAuthState(signedIn => {
      unsubscribe();
      timer = setTimeout(async () => {
        if (cancelled) {
          return;
        }
        if (!signedIn) {
          navigation.replace('Onboarding');
          return;
        }
        // Being signed in isn't enough on its own — a new user who closed
        // the app after OTP verification but before finishing Complete
        // Profile would otherwise land straight on a blank Dashboard. Check
        // every launch, not just right after OTP, since that's the only
        // way to catch someone coming back mid-setup.
        try {
          const { shop } = await getMyShop();
          if (cancelled) {
            return;
          }
          if (shop.profileCompleted) {
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'CompleteProfile' }] });
          }
        } catch {
          // A transient network hiccup here shouldn't strand someone who
          // already finished setup — fall back to the normal signed-in
          // path rather than blocking the app on this one check.
          if (!cancelled) {
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          }
        }
      }, 1500);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SplashBg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
