import React, { useState } from 'react';
import {
  ScrollView,
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
import ShopIcon from '../assets/icons/shop_details_icon.svg';
import { UploadField } from '../components/FormControls';
import {
  GST_MESSAGE,
  MOBILE_MESSAGE,
  REQUIRED_MESSAGE,
  isRequired,
  isValidGst,
  isValidMobile,
} from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

type FormErrors = {
  shopName?: string;
  gstNumber?: string;
  address?: string;
  contactNumber?: string;
};

export default function RegisterScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!isRequired(shopName)) {
      nextErrors.shopName = REQUIRED_MESSAGE;
    }
    if (gstNumber.trim() && !isValidGst(gstNumber)) {
      nextErrors.gstNumber = GST_MESSAGE;
    }
    if (!isRequired(address)) {
      nextErrors.address = REQUIRED_MESSAGE;
    }
    if (!isValidMobile(contactNumber)) {
      nextErrors.contactNumber = MOBILE_MESSAGE;
    }
    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.header}>Register</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <ShopIcon width={20} height={20} />
            <Text style={styles.title}>Shop Details</Text>
          </View>

          <Text style={styles.label}>Shop Name</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, errors.shopName ? styles.inputError : null]}
              placeholder="Mobile Hub"
              placeholderTextColor={colors.textDisabled}
              value={shopName}
              onChangeText={text => {
                setShopName(text);
                if (errors.shopName) {
                  setErrors(prev => ({ ...prev, shopName: undefined }));
                }
              }}
            />
            {errors.shopName ? <Text style={styles.errorText}>{errors.shopName}</Text> : null}
          </View>

          <Text style={styles.label}>GST Number</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, errors.gstNumber ? styles.inputError : null]}
              placeholder="27AABCU9603R1ZM"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="characters"
              value={gstNumber}
              onChangeText={text => {
                setGstNumber(text);
                if (errors.gstNumber) {
                  setErrors(prev => ({ ...prev, gstNumber: undefined }));
                }
              }}
            />
            {errors.gstNumber ? <Text style={styles.errorText}>{errors.gstNumber}</Text> : null}
          </View>

          <Text style={styles.label}>Address</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, styles.addressInput, errors.address ? styles.inputError : null]}
              placeholderTextColor={colors.textDisabled}
              multiline
              value={address}
              onChangeText={text => {
                setAddress(text);
                if (errors.address) {
                  setErrors(prev => ({ ...prev, address: undefined }));
                }
              }}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          <Text style={styles.label}>Contact Number</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, errors.contactNumber ? styles.inputError : null]}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor={colors.textDisabled}
              keyboardType="phone-pad"
              maxLength={10}
              value={contactNumber}
              onChangeText={text => {
                setContactNumber(text.replace(/[^\d]/g, ''));
                if (errors.contactNumber) {
                  setErrors(prev => ({ ...prev, contactNumber: undefined }));
                }
              }}
            />
            {errors.contactNumber ? (
              <Text style={styles.errorText}>{errors.contactNumber}</Text>
            ) : null}
          </View>

          <UploadField label="Shop Logo" imageUri={shopLogo} onImageSelected={setShopLogo} />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Shop Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    fontFamily: fonts.interMedium,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 25,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.robotoMedium,
    fontSize: 22,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.robotoRegular,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 8,
  },
  fieldWrap: {
    marginBottom: 20,
  },
  input: {
    fontFamily: fonts.robotoRegular,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
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
  addressInput: {
    height: 67,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.robotoRegular,
    color: colors.white,
    fontSize: 18,
  },
});
