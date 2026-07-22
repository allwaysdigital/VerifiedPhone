import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { getIsLoggedIn } from '../auth/authStorage';
import SplashBg from '../assets/splash_bg.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white, true);

  useEffect(() => {
    let cancelled = false;

    getIsLoggedIn().then(loggedIn => {
      const timer = setTimeout(() => {
        if (cancelled) {
          return;
        }
        if (loggedIn) {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else {
          navigation.replace('Onboarding');
        }
      }, 1500);
      return () => clearTimeout(timer);
    });

    return () => {
      cancelled = true;
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
