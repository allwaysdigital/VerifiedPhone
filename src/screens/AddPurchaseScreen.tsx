import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import {
  FormCheckbox,
  FormInput,
  FormSection,
  FormSelect,
  UploadField,
} from '../components/FormControls';
import ImeiScannerModal from '../components/ImeiScannerModal';
import { useShopData } from '../context/ShopDataContext';
import { lookupDeviceByImei } from '../api/deviceLookup';
import {
  IMEI_MESSAGE,
  MOBILE_MESSAGE,
  PERCENTAGE_MESSAGE,
  PRICE_MESSAGE,
  REQUIRED_MESSAGE,
  isPercentage,
  isPositiveNumber,
  isRequired,
  isValidImei,
  isValidMobile,
} from '../utils/validators';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'AddPurchase'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const ACCESSORY_OPTIONS = ['Charger', 'Box', 'Cable', 'Handsfree', 'Original Bill'];

type LookupStatus =
  | 'idle'
  | 'checking'
  | 'duplicate'
  | 'found'
  | 'not-found'
  | 'timeout'
  | 'unavailable'
  | 'quota-exceeded'
  | 'invalid'
  | 'auth-error'
  | 'error';

const LOOKUP_CAPTIONS: Partial<Record<LookupStatus, string>> = {
  'not-found': "Couldn't identify this device automatically — enter details manually below",
  timeout: 'Device lookup timed out — enter details manually below',
  unavailable: 'Device lookup service is unavailable right now — enter details manually below',
  'quota-exceeded': 'Device lookup limit reached — enter details manually below',
  invalid: 'That IMEI failed validation — enter details manually below',
  'auth-error': "Couldn't identify this device automatically — enter details manually below",
  error: "Couldn't identify this device automatically — enter details manually below",
};

type FormErrors = {
  brand?: string;
  model?: string;
  condition?: string;
  batteryHealth?: string;
  imei1?: string;
  imei2?: string;
  purchasePrice?: string;
  expectedSale?: string;
  fullName?: string;
  mobileNumber?: string;
  phoneFrontImage?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
};

const DUPLICATE_IMEI_MESSAGE = 'This IMEI already exists in your inventory';

export default function AddPurchaseScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { brands } = useShopData();
  const brandOptions = brands.map(b => b.name);
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [condition, setCondition] = useState<string | null>(null);
  const [batteryHealth, setBatteryHealth] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [expectedSale, setExpectedSale] = useState('');
  const [accessories, setAccessories] = useState<string[]>(['Charger']);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phoneFrontImage, setPhoneFrontImage] = useState<string | null>(null);
  const [phoneBackImage, setPhoneBackImage] = useState<string | null>(null);
  const [oldPhoneBill, setOldPhoneBill] = useState<string | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<string | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [deviceFieldsLocked, setDeviceFieldsLocked] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const lastLookedUpImei = useRef('');

  const runLookup = async (imei: string, opts?: { force?: boolean }) => {
    if (!opts?.force && imei === lastLookedUpImei.current) {
      return;
    }
    lastLookedUpImei.current = imei;
    setLookupStatus('checking');
    try {
      const result = await lookupDeviceByImei(imei);
      if (result.duplicate) {
        setDeviceFieldsLocked(false);
        setLookupStatus('duplicate');
        setErrors(prev => ({ ...prev, imei1: DUPLICATE_IMEI_MESSAGE }));
        return;
      }
      clearError('imei1');
      if (result.found) {
        setBrand(result.device.brand);
        setModel(result.device.model);
        setRam(result.device.ram);
        setStorage(result.device.storage);
        setDeviceFieldsLocked(true);
        setLookupStatus('found');
      } else {
        setDeviceFieldsLocked(false);
        setLookupStatus(result.errorType === 'invalid-imei' ? 'invalid' : result.errorType ?? 'not-found');
      }
    } catch {
      setDeviceFieldsLocked(false);
      setLookupStatus('error');
    }
  };

  useEffect(() => {
    if (isValidImei(imei1)) {
      runLookup(imei1);
    } else if (lookupStatus !== 'idle' || deviceFieldsLocked) {
      setLookupStatus('idle');
      setDeviceFieldsLocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imei1]);

  const toggleAccessory = (item: string) => {
    setAccessories(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item],
    );
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!brand) {
      nextErrors.brand = REQUIRED_MESSAGE;
    }
    if (!isRequired(model)) {
      nextErrors.model = REQUIRED_MESSAGE;
    }
    if (!condition) {
      nextErrors.condition = REQUIRED_MESSAGE;
    }
    if (batteryHealth.trim() && !isPercentage(batteryHealth)) {
      nextErrors.batteryHealth = PERCENTAGE_MESSAGE;
    }
    if (!isValidImei(imei1)) {
      nextErrors.imei1 = IMEI_MESSAGE;
    } else if (lookupStatus === 'duplicate') {
      nextErrors.imei1 = DUPLICATE_IMEI_MESSAGE;
    }
    if (imei2.trim() && !isValidImei(imei2)) {
      nextErrors.imei2 = IMEI_MESSAGE;
    }
    if (!isPositiveNumber(purchasePrice)) {
      nextErrors.purchasePrice = PRICE_MESSAGE;
    }
    if (expectedSale.trim() && !isPositiveNumber(expectedSale)) {
      nextErrors.expectedSale = PRICE_MESSAGE;
    }
    if (!isRequired(fullName)) {
      nextErrors.fullName = REQUIRED_MESSAGE;
    }
    if (!isValidMobile(mobileNumber)) {
      nextErrors.mobileNumber = MOBILE_MESSAGE;
    }
    if (!phoneFrontImage) {
      nextErrors.phoneFrontImage = REQUIRED_MESSAGE;
    }
    if (!aadhaarFront) {
      nextErrors.aadhaarFront = REQUIRED_MESSAGE;
    }
    if (!aadhaarBack) {
      nextErrors.aadhaarBack = REQUIRED_MESSAGE;
    }
    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    navigation.navigate('DigitalSignature', {
      purchaseData: {
        brand: brand!,
        model,
        color,
        ram,
        storage,
        condition: condition!,
        batteryHealth,
        imei1,
        imei2,
        purchasePrice,
        expectedSale,
        accessories,
        fullName,
        mobileNumber,
        address,
        city,
        phoneFrontImage,
        phoneBackImage,
        oldPhoneBill,
        aadhaarFront,
        aadhaarBack,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Add Purchase</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="IMEI Information">
          <View style={styles.scanRow}>
            <Text style={styles.scanHint}>Scan the barcode or enter manually</Text>
            <TouchableOpacity onPress={() => setScannerVisible(true)}>
              <Text style={styles.scanLink}>Scan Barcode</Text>
            </TouchableOpacity>
          </View>
          <FormInput
            label="IMEI 1"
            required
            placeholder="Enter 15-Digit IMEI"
            keyboardType="number-pad"
            maxLength={15}
            value={imei1}
            error={errors.imei1}
            onChangeText={text => {
              setImei1(text.replace(/[^\d]/g, ''));
              clearError('imei1');
            }}
          />
          <FormInput
            label="IMEI 2"
            placeholder="Enter 15-Digit IMEI (If dual SIM)"
            keyboardType="number-pad"
            maxLength={15}
            value={imei2}
            error={errors.imei2}
            onChangeText={text => {
              setImei2(text.replace(/[^\d]/g, ''));
              clearError('imei2');
            }}
          />
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => isValidImei(imei1) && runLookup(imei1, { force: true })}>
            <Text style={styles.verifyButtonText}>
              {lookupStatus === 'checking' ? 'Checking…' : 'Verify IMEI Online'}
            </Text>
          </TouchableOpacity>
          {lookupStatus === 'checking' ? (
            <Text style={styles.lookupMutedText}>Looking up device information…</Text>
          ) : null}
          {lookupStatus === 'found' ? (
            <Text style={styles.lookupFoundText}>
              ✓ Device recognized — details auto-filled below
            </Text>
          ) : null}
          {LOOKUP_CAPTIONS[lookupStatus] ? (
            <Text style={styles.lookupMutedText}>{LOOKUP_CAPTIONS[lookupStatus]}</Text>
          ) : null}
        </FormSection>

        <FormSection
          title="Device Information"
          headerRight={
            deviceFieldsLocked ? (
              <TouchableOpacity onPress={() => setDeviceFieldsLocked(false)}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            ) : null
          }>
          <FormSelect
            label="Brand"
            required
            placeholder="Select Brand"
            options={brandOptions}
            value={brand}
            error={errors.brand}
            disabled={deviceFieldsLocked}
            onChange={value => {
              setBrand(value);
              clearError('brand');
            }}
          />
          <FormInput
            label="Model"
            required
            placeholder="Enter Model Name"
            value={model}
            error={errors.model}
            editable={!deviceFieldsLocked}
            onChangeText={text => {
              setModel(text);
              clearError('model');
            }}
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormInput label="Color" placeholder="Color" value={color} onChangeText={setColor} />
            </View>
            <View style={styles.rowItem}>
              <FormInput
                label="RAM"
                placeholder="e.g., 8GB"
                value={ram}
                editable={!deviceFieldsLocked}
                onChangeText={setRam}
              />
            </View>
          </View>
          <FormInput
            label="Storage"
            placeholder="e.g., 128GB"
            value={storage}
            editable={!deviceFieldsLocked}
            onChangeText={setStorage}
          />
          <FormSelect
            label="Condition"
            required
            placeholder="Select Condition"
            options={CONDITION_OPTIONS}
            value={condition}
            error={errors.condition}
            onChange={value => {
              setCondition(value);
              clearError('condition');
            }}
          />
          <FormInput
            label="Battery Health %"
            placeholder="e.g., 85"
            keyboardType="number-pad"
            value={batteryHealth}
            error={errors.batteryHealth}
            onChangeText={text => {
              setBatteryHealth(text.replace(/[^\d]/g, ''));
              clearError('batteryHealth');
            }}
          />
        </FormSection>

        <FormSection title="Purchase Details">
          <FormInput
            label="Purchase Price (₹)"
            required
            placeholder="Enter  Purchase Price"
            keyboardType="number-pad"
            value={purchasePrice}
            error={errors.purchasePrice}
            onChangeText={text => {
              setPurchasePrice(text.replace(/[^\d]/g, ''));
              clearError('purchasePrice');
            }}
          />
          <FormInput
            label="Expected Sale"
            placeholder="Enter Expected Sale"
            keyboardType="number-pad"
            value={expectedSale}
            error={errors.expectedSale}
            onChangeText={text => {
              setExpectedSale(text.replace(/[^\d]/g, ''));
              clearError('expectedSale');
            }}
          />
          <Text style={styles.label}>Accessories Included</Text>
          <View style={styles.accessoriesGrid}>
            {ACCESSORY_OPTIONS.map(item => (
              <View key={item} style={styles.accessoryItem}>
                <FormCheckbox
                  label={item}
                  checked={accessories.includes(item)}
                  onToggle={() => toggleAccessory(item)}
                />
              </View>
            ))}
          </View>
        </FormSection>

        <FormSection title="Personal Information">
          <FormInput
            label="Full Name"
            required
            placeholder="Enter full name"
            value={fullName}
            error={errors.fullName}
            onChangeText={text => {
              setFullName(text);
              clearError('fullName');
            }}
          />
          <FormInput
            label="Mobile Number"
            required
            placeholder="Enter 10-digit mobile"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobileNumber}
            error={errors.mobileNumber}
            onChangeText={text => {
              setMobileNumber(text.replace(/[^\d]/g, ''));
              clearError('mobileNumber');
            }}
          />
          <FormInput
            label="Address"
            placeholder="Enter complete address"
            value={address}
            onChangeText={setAddress}
          />
          <FormInput label="City" placeholder="City" value={city} onChangeText={setCity} />
        </FormSection>

        <FormSection title="Purchase Details">
          <UploadField
            testID="upload-phone-front"
            label="Phone Front Image"
            required
            imageUri={phoneFrontImage}
            error={errors.phoneFrontImage}
            onImageSelected={uri => {
              setPhoneFrontImage(uri);
              clearError('phoneFrontImage');
            }}
          />
          <UploadField
            testID="upload-phone-back"
            label="Phone Back Image"
            imageUri={phoneBackImage}
            onImageSelected={setPhoneBackImage}
          />
          <UploadField
            testID="upload-old-phone-bill"
            label="Old Phone Bill"
            imageUri={oldPhoneBill}
            onImageSelected={setOldPhoneBill}
          />
          <UploadField
            testID="upload-aadhaar-front"
            label="Upload Aadhaar Front"
            required
            imageUri={aadhaarFront}
            error={errors.aadhaarFront}
            onImageSelected={uri => {
              setAadhaarFront(uri);
              clearError('aadhaarFront');
            }}
          />
          <UploadField
            testID="upload-aadhaar-back"
            label="Upload Aadhaar Back"
            required
            imageUri={aadhaarBack}
            error={errors.aadhaarBack}
            onImageSelected={uri => {
              setAadhaarBack(uri);
              clearError('aadhaarBack');
            }}
          />
        </FormSection>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ImeiScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={digits => {
          setImei1(digits.slice(0, 15));
          clearError('imei1');
          setScannerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  accessoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  accessoryItem: {
    width: '50%',
  },
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanHint: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  scanLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  lookupFoundText: {
    fontSize: 13,
    color: colors.greenDark,
    marginTop: 10,
    textAlign: 'center',
  },
  lookupMutedText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
