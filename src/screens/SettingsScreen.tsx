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
import Svg, { Path } from 'react-native-svg';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { setLoggedIn } from '../auth/authStorage';
import ShopIcon from '../assets/icons/shop_details_icon.svg';
import UploadIcon from '../assets/icons/upload_icon.svg';

type Props = BottomTabScreenProps<MainTabParamList, 'Settings'>;

const APP_VERSION = '1.0.0';
const APP_BUILD = '2026.2.23';

function LogoutIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17l5-5-5-5"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12H9"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [shopName, setShopName] = useState('Mobile Hub');
  const [gstNumber, setGstNumber] = useState('27AABCU9603R1ZM');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('+91 98765 43210');

  const handleSave = () => {
    // Persisting shop details is not wired to a backend yet.
  };

  const handleLogout = async () => {
    await setLoggedIn(false);
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <ShopIcon width={20} height={20} />
            <Text style={styles.title}>Shop Details</Text>
          </View>

          <Text style={styles.label}>Shop Name</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textDisabled}
            value={shopName}
            onChangeText={setShopName}
          />

          <Text style={styles.label}>GST Number</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textDisabled}
            autoCapitalize="characters"
            value={gstNumber}
            onChangeText={setGstNumber}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholderTextColor={colors.textDisabled}
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textDisabled}
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />

          <Text style={styles.label}>Shop Logo</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <UploadIcon width={24} height={24} />
            <Text style={styles.uploadText}>Upload Logo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Shop Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About App</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version:</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build:</Text>
            <Text style={styles.aboutValue}>{APP_BUILD}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogoutIcon />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
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
  input: {
    fontFamily: fonts.robotoRegular,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  addressInput: {
    height: 67,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 24,
  },
  uploadText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 16,
    color: colors.textMuted,
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
  aboutCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 25,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 4,
  },
  aboutTitle: {
    fontFamily: fonts.robotoMedium,
    fontSize: 22,
    color: colors.textMuted,
    marginBottom: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aboutLabel: {
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: colors.textFaint,
  },
  aboutValue: {
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.danger,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: fonts.robotoBold,
    color: colors.white,
    fontSize: 18,
  },
});
