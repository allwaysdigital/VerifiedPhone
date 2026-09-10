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
import { getAuthErrorMessage, sendOtp } from '../auth/firebaseAuth';
import { useShopData } from '../context/ShopDataContext';
import LogoMark from '../assets/logo_mark.svg';
import { isValidOtp } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;
const OTP_LENGTH = 6;

export default function OtpVerifyScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { registerShop } = useShopData();
  const { dialCode, phoneNumber, pendingShopDetails } = route.params;
  const [confirmation, setConfirmation] = useState(route.params.confirmation);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleOtpChange = (text: string) => {
    setOtp(text.replace(/[^\d]/g, ''));
    if (error) {
      setError('');
    }
  };

  const handleVerify = async () => {
    if (!isValidOtp(otp, OTP_LENGTH)) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }
    setVerifying(true);
    try {
      await confirmation.confirm(otp);
      if (pendingShopDetails) {
        await registerShop({
          shopName: pendingShopDetails.shopName,
          gstNumber: pendingShopDetails.gstNumber,
          address: pendingShopDetails.address,
          contactNumber: pendingShopDetails.contactNumber,
          logoUri: pendingShopDetails.shopLogoUri,
        });
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const nextConfirmation = await sendOtp(dialCode, phoneNumber);
      setConfirmation(nextConfirmation);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Could not resend OTP. Please try again.'));
    } finally {
      setResending(false);
    }
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
            <Text style={styles.readOnlyText}>{dialCode} {phoneNumber}</Text>
          </View>

          <Text style={styles.label}>OTP</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="OTP"
              placeholderTextColor={colors.textDisabled}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              value={otp}
              onChangeText={handleOtpChange}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, verifying && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={verifying}>
            <Text style={styles.buttonText}>{verifying ? 'Verifying…' : 'Verify'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendText}>
              {resending ? 'Resending…' : 'Resend OTP'}
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
  buttonDisabled: {
    opacity: 0.6,
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
