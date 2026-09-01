import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import {
  FormCheckbox,
  FormInput,
  FormSection,
  FormSelect,
  UploadField,
} from '../components/FormControls';
import { useShopData } from '../context/ShopDataContext';
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
import BackButton from '../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPurchase'>;

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const ACCESSORY_OPTIONS = ['Charger', 'Box', 'Cable', 'Handsfree', 'Original Bill'];

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
    if (imei1.trim() && !isValidImei(imei1)) {
      nextErrors.imei1 = IMEI_MESSAGE;
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
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Add Purchase</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Device Information">
          <FormSelect
            label="Brand"
            required
            placeholder="Select Brand"
            options={brandOptions}
            value={brand}
            error={errors.brand}
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
              <FormInput label="RAM" placeholder="e.g., 8GB" value={ram} onChangeText={setRam} />
            </View>
          </View>
          <FormInput
            label="Storage"
            placeholder="e.g., 128GB"
            value={storage}
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

        <FormSection title="IMEI Information">
          <FormInput
            label="IMEI 1"
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
          <TouchableOpacity style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>Verify IMEI Online</Text>
          </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
