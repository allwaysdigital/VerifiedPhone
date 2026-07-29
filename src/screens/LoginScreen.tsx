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
import { isValidMobile, MOBILE_MESSAGE } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text.replace(/[^\d]/g, ''));
    if (error) {
      setError('');
    }
  };

  const handleSendOtp = () => {
    if (!isValidMobile(phoneNumber)) {
      setError(MOBILE_MESSAGE);
      return;
    }
    navigation.navigate('OtpVerify', { phoneNumber });
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
          <Text style={styles.title}>
            <Text style={styles.titleDefault}>Enter your </Text>
            <Text style={styles.titleHighlight}>phone number</Text>
          </Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Mobile Number."
              placeholderTextColor={colors.textDisabled}
              keyboardType="number-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              <Text style={styles.registerMuted}>Don’t have an account? </Text>
              <Text style={styles.registerLink}>Register</Text>
            </Text>
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
  title: {
    fontFamily: fonts.robotoMedium,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 24,
  },
  titleDefault: {
    color: colors.text,
  },
  titleHighlight: {
    color: colors.primary,
  },
  fieldWrap: {
    marginBottom: 24,
  },
  input: {
    fontFamily: fonts.robotoRegular,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: colors.danger,
    marginTop: 8,
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
  registerText: {
    fontFamily: fonts.robotoRegular,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  registerMuted: {
    color: colors.textMuted,
  },
  registerLink: {
    color: colors.primary,
  },
});
