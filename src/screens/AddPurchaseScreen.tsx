import React, { useState } from 'react';
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

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'AddPurchase'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BRAND_OPTIONS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Others'];
const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const ACCESSORY_OPTIONS = ['Charger', 'Box', 'Cable', 'Handsfree', 'Original Bill'];

export default function AddPurchaseScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [brand, setBrand] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [accessories, setAccessories] = useState<string[]>(['Charger']);

  const toggleAccessory = (item: string) => {
    setAccessories(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item],
    );
  };

  const handleSave = () => {
    navigation.navigate('DigitalSignature');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Add Purchase</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Device Information">
          <FormSelect
            label="Brand"
            required
            placeholder="Select Brand"
            options={BRAND_OPTIONS}
            value={brand}
            onChange={setBrand}
          />
          <FormInput label="Model" required placeholder="Enter Model Name" />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormInput label="Color" placeholder="Color" />
            </View>
            <View style={styles.rowItem}>
              <FormInput label="RAM" placeholder="e.g., 8GB" />
            </View>
          </View>
          <FormInput label="Storage" placeholder="e.g., 128GB" />
          <FormSelect
            label="Condition"
            required
            placeholder="Select Condition"
            options={CONDITION_OPTIONS}
            value={condition}
            onChange={setCondition}
          />
          <FormInput
            label="Battery Health %"
            placeholder="e.g., 85"
            keyboardType="number-pad"
          />
        </FormSection>

        <FormSection title="IMEI Information">
          <FormInput label="IMEI 1" required placeholder="Enter 15-Digit IMEI" keyboardType="number-pad" maxLength={15} />
          <FormInput
            label="IMEI 2"
            placeholder="Enter 15-Digit IMEI (If dual SIM)"
            keyboardType="number-pad"
            maxLength={15}
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
          />
          <FormInput
            label="Expected Sale"
            placeholder="Enter Expected Sale"
            keyboardType="number-pad"
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
          <FormInput label="Full Name" required placeholder="Enter full name" />
          <FormInput
            label="Mobile Number"
            required
            placeholder="Enter 10-digit mobile"
            keyboardType="phone-pad"
            maxLength={10}
          />
          <FormInput label="Address" placeholder="Enter complete address" />
          <FormInput label="City" placeholder="City" />
        </FormSection>

        <FormSection title="Purchase Details">
          <UploadField label="Phone Front Image" required />
          <UploadField label="Phone Back Image" />
          <UploadField label="Old Phone Bill" />
          <UploadField label="Upload Aadhaar Front" required />
          <UploadField label="Upload Aadhaar Back" required />
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
