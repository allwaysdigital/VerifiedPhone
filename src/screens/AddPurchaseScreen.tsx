import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useDisableBackNavigation } from '../hooks/useDisableBackNavigation';
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
import { savingLabel } from '../utils/upload';

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

export default function AddPurchaseScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  useDisableBackNavigation();
  const { brands, devices, updateDevice } = useShopData();
  // Editing an existing purchase (VP-17) pre-fills every field from it.
  const editing = route.params?.deviceId
    ? devices.find(d => d.id === route.params?.deviceId)
    : undefined;
  const brandOptions = brands.map(b => b.name);
  if (editing && !brandOptions.includes(editing.brand)) {
    brandOptions.push(editing.brand);
  }
  const numberText = (value?: number | null) => (value ? String(value) : '');
  const [brand, setBrand] = useState<string | null>(editing?.brand ?? null);
  const [model, setModel] = useState(editing?.model ?? '');
  const [color, setColor] = useState(editing?.color ?? '');
  const [ram, setRam] = useState(editing?.ram ?? '');
  const [storage, setStorage] = useState(editing?.storage ?? '');
  const [condition, setCondition] = useState<string | null>(editing?.condition ?? null);
  const [batteryHealth, setBatteryHealth] = useState(numberText(editing?.batteryHealth));
  const [imei1, setImei1] = useState(editing?.imei1 ?? '');
  const [imei2, setImei2] = useState(editing?.imei2 ?? '');
  const [purchasePrice, setPurchasePrice] = useState(numberText(editing?.purchasePrice));
  const [expectedSale, setExpectedSale] = useState(numberText(editing?.expectedSalePrice));
  const [accessories, setAccessories] = useState<string[]>(editing?.accessories ?? ['Charger']);
  const [fullName, setFullName] = useState(editing?.sellerName ?? '');
  const [mobileNumber, setMobileNumber] = useState(editing?.sellerMobile ?? '');
  const [city, setCity] = useState(editing?.sellerCity ?? '');
  const [sellerPhoto, setSellerPhoto] = useState<string | null>(editing?.sellerPhotoUrl ?? null);
  const [phoneFrontImage, setPhoneFrontImage] = useState<string | null>(
    editing?.phoneFrontImageUrl ?? null,
  );
  const [phoneBackImage, setPhoneBackImage] = useState<string | null>(
    editing?.phoneBackImageUrl ?? null,
  );
  const [oldPhoneBill, setOldPhoneBill] = useState<string | null>(editing?.oldPhoneBillUrl ?? null);
  const [aadhaarFront, setAadhaarFront] = useState<string | null>(editing?.aadhaarFrontUrl ?? null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(editing?.aadhaarBackUrl ?? null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saveError, setSaveError] = useState('');

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

  // The seller already signed when the phone was bought, so an edit saves
  // straight away instead of asking for the signature again.
  const saveEdit = async (deviceId: string) => {
    setSaving(true);
    setSaveError('');
    setUploadProgress(null);
    try {
      await updateDevice(
        deviceId,
        {
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
          expectedSalePrice: expectedSale,
          accessories,
          sellerName: fullName,
          sellerMobile: mobileNumber,
          sellerAddress: editing?.sellerAddress ?? '',
          sellerCity: city,
          phoneFrontImageUri: phoneFrontImage,
          phoneBackImageUri: phoneBackImage,
          oldPhoneBillUri: oldPhoneBill,
          sellerPhotoUri: sellerPhoto,
          aadhaarFrontUri: aadhaarFront,
          aadhaarBackUri: aadhaarBack,
        },
        setUploadProgress,
      );
      ToastAndroid.show('Purchase updated', ToastAndroid.SHORT);
      navigation.goBack();
    } catch {
      setSaveError('Could not save your changes. Please check your connection and try again.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  const handleSave = () => {
    if (saving) {
      return;
    }
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    if (editing) {
      saveEdit(editing.id);
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
        city,
        sellerPhoto,
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
        <Text style={styles.headerTitle}>{editing ? 'Edit Purchase' : 'Add Purchase'}</Text>
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
          {/* Temporarily hidden per request — not wired to a real verification
              service yet. Restore by uncommenting when that's ready. */}
          {/* <TouchableOpacity style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>Verify IMEI Online</Text>
          </TouchableOpacity> */}
        </FormSection>

        <FormSection title="Price & Accessories">
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

        <FormSection title="Seller Details">
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
          <FormInput label="City" placeholder="City" value={city} onChangeText={setCity} />
          <UploadField
            testID="upload-seller-photo"
            label="Personal Photo"
            imageUri={sellerPhoto}
            onImageSelected={setSellerPhoto}
          />
        </FormSection>

        <FormSection title="Photos & Documents">
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
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonBusy]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={colors.white} /> : null}
            <Text style={styles.saveButtonText}>{saving ? savingLabel(uploadProgress) : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        {saveError ? <Text style={styles.saveErrorText}>{saveError}</Text> : null}
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
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonBusy: {
    opacity: 0.85,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  saveErrorText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: colors.danger,
  },
});
