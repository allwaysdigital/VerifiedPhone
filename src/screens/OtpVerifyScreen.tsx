import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import LogoMark from '../assets/logo_mark.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp.length < 4) {
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoWrap}>
        <LogoMark width={137} height={100} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centerWrap}>
        <View style={styles.card}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>+91 {phoneNumber}</Text>
          </View>

          <Text style={styles.label}>OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="OTP"
            placeholderTextColor={colors.textDisabled}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={text => setOtp(text.replace(/[^\d]/g, ''))}
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 25,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 8,
  },
  label: {
    fontFamily: fonts.robotoMedium,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textMuted,
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  readOnlyText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 16,
    color: colors.text,
  },
  input: {
    fontFamily: fonts.robotoRegular,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.robotoSemiBold,
    color: colors.white,
    fontSize: 18,
  },
  resendText: {
    fontFamily: fonts.robotoRegular,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: colors.primary,
  },
});
