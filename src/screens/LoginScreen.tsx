import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
import { getAuthErrorMessage, sendOtp } from '../auth/firebaseAuth';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../data/countryCodes';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [dialCode, setDialCode] = useState(DEFAULT_COUNTRY_CODE.dialCode);
  const [codePickerVisible, setCodePickerVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text.replace(/[^\d]/g, ''));
    if (error) {
      setError('');
    }
  };

  const handleSendOtp = async () => {
    if (!isValidMobile(phoneNumber)) {
      setError(MOBILE_MESSAGE);
      return;
    }
    setSending(true);
    try {
      const confirmation = await sendOtp(dialCode, phoneNumber);
      navigation.navigate('OtpVerify', {
        dialCode,
        phoneNumber,
        confirmation,
        pendingShopDetails: route.params?.pendingShopDetails,
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Could not send OTP. Please try again.'));
    } finally {
      setSending(false);
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
          <Text style={styles.title}>
            <Text style={styles.titleDefault}>Enter your </Text>
            <Text style={styles.titleHighlight}>phone number</Text>
          </Text>
          <View style={styles.fieldWrap}>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.codeButton}
                onPress={() => setCodePickerVisible(true)}>
                <Text style={styles.codeButtonText}>{dialCode}</Text>
                <Text style={styles.chevron}>⌄</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.phoneInput, error ? styles.inputError : null]}
                placeholder="Mobile Number."
                placeholderTextColor={colors.textDisabled}
                keyboardType="number-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Modal
            visible={codePickerVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCodePickerVisible(false)}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setCodePickerVisible(false)}>
              <View style={styles.modalSheet}>
                <FlatList
                  data={COUNTRY_CODES}
                  keyExtractor={item => item.dialCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setDialCode(item.dialCode);
                        setCodePickerVisible(false);
                      }}>
                      <Text style={styles.modalOptionText}>
                        {item.flag} {item.name} ({item.dialCode})
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
          <TouchableOpacity
            style={[styles.button, sending && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={sending}>
            <Text style={styles.buttonText}>{sending ? 'Sending OTP…' : 'Send OTP'}</Text>
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
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 12,
  },
  codeButtonText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 16,
    color: colors.text,
  },
  chevron: {
    fontSize: 14,
    color: colors.textDisabled,
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
  phoneInput: {
    flex: 1,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
    paddingVertical: 8,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
});
