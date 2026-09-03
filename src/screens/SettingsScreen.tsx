import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { logout } from '../auth/firebaseAuth';
import { useShopData } from '../context/ShopDataContext';
import ShopIcon from '../assets/icons/shop_details_icon.svg';
import AddBrandPersonIcon from '../assets/icons/add_brand_person.svg';
import { UploadField } from '../components/FormControls';
import { GiftIcon, WarningIcon } from '../components/SubscriptionIcons';
import { APP_BUILD, APP_VERSION } from '../constants/app';
import {
  GST_MESSAGE,
  MOBILE_MESSAGE,
  REQUIRED_MESSAGE,
  isRequired,
  isValidGst,
  isValidMobile,
} from '../utils/validators';

type Props = BottomTabScreenProps<MainTabParamList, 'Settings'>;

type FormErrors = {
  shopName?: string;
  gstNumber?: string;
  address?: string;
  contactNumber?: string;
};

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

function SupportIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        stroke={colors.white}
        strokeWidth={2}
      />
      <Path
        d="M9.5 9a2.5 2.5 0 0 1 4.86.833c0 1.667-2.36 1.667-2.36 3.334"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 17.5v.01" stroke={colors.white} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { shop, subscription, updateShop } = useShopData();
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (shop) {
        setShopName(shop.shopName);
        setGstNumber(shop.gstNumber);
        setAddress(shop.address);
        setContactNumber(shop.contactNumber);
        setShopLogo(shop.logoUrl);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shop]),
  );

  const hasAccess = subscription?.status === 'trial' || subscription?.status === 'active';

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

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

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSaving(true);
    try {
      // A logo URI that already starts with http(s) is the existing server-hosted
      // image, not a newly picked local file — only upload when it's a local URI.
      const logoUri = shopLogo && !shopLogo.startsWith('http') ? shopLogo : null;
      await updateShop({ shopName, gstNumber, address, contactNumber, logoUri });
    } catch (err) {
      setErrors({ shopName: 'Could not save shop details. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleManageBrandsPress = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Brands');
  };

  const handleAppSupportPress = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('AppSupport');
  };

  const handleSubscriptionPress = () => {
    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (hasAccess) {
      rootNavigation?.navigate('ManageSubscription');
    } else {
      rootNavigation?.navigate('SubscriptionPlans');
    }
  };

  const handleLogout = async () => {
    await logout();
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
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, errors.shopName ? styles.inputError : null]}
              placeholderTextColor={colors.textDisabled}
              value={shopName}
              onChangeText={text => {
                setShopName(text);
                clearError('shopName');
              }}
            />
            {errors.shopName ? <Text style={styles.errorText}>{errors.shopName}</Text> : null}
          </View>

          <Text style={styles.label}>GST Number</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, errors.gstNumber ? styles.inputError : null]}
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="characters"
              value={gstNumber}
              onChangeText={text => {
                setGstNumber(text);
                clearError('gstNumber');
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
                clearError('address');
              }}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          <Text style={styles.label}>Contact Number</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, errors.contactNumber ? styles.inputError : null]}
              placeholderTextColor={colors.textDisabled}
              keyboardType="phone-pad"
              maxLength={10}
              value={contactNumber}
              onChangeText={text => {
                setContactNumber(text.replace(/[^\d]/g, ''));
                clearError('contactNumber');
              }}
            />
            {errors.contactNumber ? (
              <Text style={styles.errorText}>{errors.contactNumber}</Text>
            ) : null}
          </View>

          <UploadField label="Shop Logo" imageUri={shopLogo} onImageSelected={setShopLogo} />

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save Shop Details'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.subscriptionCard} onPress={handleManageBrandsPress}>
          <View style={[styles.subscriptionIconWrap, { backgroundColor: colors.pink }]}>
            <AddBrandPersonIcon width={20} height={20} />
          </View>
          <View style={styles.subscriptionTextWrap}>
            <Text style={styles.subscriptionTitle}>Manage Brands</Text>
            <Text style={styles.subscriptionSubtitle}>Add or view the brands used in Add Purchase</Text>
          </View>
          <Text style={styles.subscriptionChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.subscriptionCard} onPress={handleSubscriptionPress}>
          <View
            style={[
              styles.subscriptionIconWrap,
              { backgroundColor: hasAccess ? colors.green : colors.danger },
            ]}>
            {hasAccess ? <GiftIcon size={20} /> : <WarningIcon size={20} color={colors.white} />}
          </View>
          <View style={styles.subscriptionTextWrap}>
            <Text style={styles.subscriptionTitle}>Subscription</Text>
            <Text style={styles.subscriptionSubtitle}>
              {subscription?.status === 'trial'
                ? 'Free trial active'
                : subscription?.status === 'active'
                ? 'Subscription active'
                : 'No active subscription'}
            </Text>
          </View>
          <Text style={styles.subscriptionChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.subscriptionCard} onPress={handleAppSupportPress}>
          <View style={[styles.subscriptionIconWrap, { backgroundColor: colors.blue }]}>
            <SupportIcon />
          </View>
          <View style={styles.subscriptionTextWrap}>
            <Text style={styles.subscriptionTitle}>App Support</Text>
            <Text style={styles.subscriptionSubtitle}>Help, FAQs & contact us</Text>
          </View>
          <Text style={styles.subscriptionChevron}>›</Text>
        </TouchableOpacity>

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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.robotoRegular,
    color: colors.white,
    fontSize: 18,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 4,
  },
  subscriptionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTextWrap: {
    flex: 1,
  },
  subscriptionTitle: {
    fontFamily: fonts.robotoMedium,
    fontSize: 16,
    color: colors.text,
  },
  subscriptionSubtitle: {
    fontFamily: fonts.robotoRegular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  subscriptionChevron: {
    fontSize: 22,
    color: colors.textFaint,
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
