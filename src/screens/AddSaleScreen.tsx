import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useDisableBackNavigation } from '../hooks/useDisableBackNavigation';
import { FormInput, FormSection, FormSelect, UploadField } from '../components/FormControls';
import BackButton from '../components/BackButton';
import { useShopData } from '../context/ShopDataContext';
import type { Device } from '../types/domain';
import {
  MOBILE_MESSAGE,
  PRICE_MESSAGE,
  REQUIRED_MESSAGE,
  isPositiveNumber,
  isRequired,
  isValidMobile,
} from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'AddSale'>;

const PAYMENT_MODE_OPTIONS = ['Cash', 'UPI', 'Bank Transfer', 'Card'];

function phoneLabel(device: Device): string {
  return `${device.model} - ₹${device.expectedSalePrice.toLocaleString('en-IN')}`;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function AddSaleScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  useDisableBackNavigation();
  const { devices, markDeviceSold } = useShopData();
  const availableDevices = devices.filter(d => d.status === 'Available');
  const [selectedPhone, setSelectedPhone] = useState<string | null>(() => {
    const preselected = availableDevices.find(d => d.id === route.params?.deviceId);
    return preselected ? phoneLabel(preselected) : null;
  });
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [buyerPhoto, setBuyerPhoto] = useState<string | null>(null);
  const [buyerAadhaarFront, setBuyerAadhaarFront] = useState<string | null>(null);
  const [buyerAadhaarBack, setBuyerAadhaarBack] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [paymentMode, setPaymentMode] = useState<string | null>(null);
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedDevice =
    availableDevices.find(d => phoneLabel(d) === selectedPhone) ?? null;

  const handleSelectPhone = (label: string) => {
    setSelectedPhone(label);
    const device = availableDevices.find(d => phoneLabel(d) === label);
    if (device) {
      setSalePrice(String(device.expectedSalePrice));
    }
  };

  const salePriceNum = Number(salePrice) || 0;
  const purchasePrice = selectedDevice?.purchasePrice ?? 0;
  const profit = selectedDevice ? salePriceNum - purchasePrice : 0;
  const margin = selectedDevice && purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

  const errors = {
    selectedPhone: selectedDevice ? undefined : REQUIRED_MESSAGE,
    customerName: isRequired(customerName) ? undefined : REQUIRED_MESSAGE,
    customerMobile: isValidMobile(customerMobile) ? undefined : MOBILE_MESSAGE,
    salePrice: isPositiveNumber(salePrice) ? undefined : PRICE_MESSAGE,
    paymentMode: paymentMode ? undefined : REQUIRED_MESSAGE,
  };
  const canComplete = Object.values(errors).every(error => !error);
  const showErrors = attemptedSubmit;

  const handleComplete = async () => {
    setAttemptedSubmit(true);
    if (!canComplete || !selectedDevice || submitting) {
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await markDeviceSold(selectedDevice.id, {
        buyerName: customerName,
        buyerMobile: customerMobile,
        buyerAddress: customerAddress,
        buyerPhotoUri: buyerPhoto,
        buyerAadhaarFrontUri: buyerAadhaarFront,
        buyerAadhaarBackUri: buyerAadhaarBack,
        salePrice: salePriceNum,
        warrantyPeriod,
      });
      navigation.navigate('InvoicePreview', {
        deviceId: selectedDevice.id,
        customerName,
        customerMobile,
        customerAddress,
        salePrice: salePriceNum,
        warrantyPeriod,
      });
    } catch (err) {
      setSubmitError('Could not complete this sale. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Add Sale</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Select Phone from Stock">
          <FormSelect
            label=""
            placeholder="Select Phone"
            options={availableDevices.map(phoneLabel)}
            value={selectedPhone}
            error={showErrors ? errors.selectedPhone : undefined}
            onChange={handleSelectPhone}
          />
          {selectedDevice ? (
            <View style={styles.deviceCard}>
              <View style={styles.deviceCardRow}>
                <DetailField label="Model" value={selectedDevice.model} />
                <DetailField label="IMEI" value={`...${selectedDevice.imei1.slice(-4)}`} />
              </View>
              <View style={styles.deviceCardRow}>
                <DetailField label="Storage" value={selectedDevice.storage} />
                <DetailField label="Battery" value={`${selectedDevice.batteryHealth}%`} />
              </View>
            </View>
          ) : null}
        </FormSection>

        <FormSection title="Customer Details">
          <FormInput
            label="Customer Name"
            required
            placeholder="Enter  Customer name"
            value={customerName}
            error={showErrors ? errors.customerName : undefined}
            onChangeText={setCustomerName}
          />
          <FormInput
            label="Customer Mobile"
            required
            placeholder="Enter mobile no."
            keyboardType="phone-pad"
            maxLength={10}
            value={customerMobile}
            error={showErrors ? errors.customerMobile : undefined}
            onChangeText={text => setCustomerMobile(text.replace(/[^\d]/g, ''))}
          />
          <FormInput
            label="Customer Address"
            placeholder="Enter customer address"
            multiline
            style={styles.addressInput}
            value={customerAddress}
            onChangeText={setCustomerAddress}
          />
          <UploadField
            testID="upload-buyer-photo"
            label="Personal Photo"
            imageUri={buyerPhoto}
            onImageSelected={setBuyerPhoto}
          />
          <UploadField
            testID="upload-buyer-aadhaar-front"
            label="Upload Aadhaar Front"
            imageUri={buyerAadhaarFront}
            onImageSelected={setBuyerAadhaarFront}
          />
          <UploadField
            testID="upload-buyer-aadhaar-back"
            label="Upload Aadhaar Back"
            imageUri={buyerAadhaarBack}
            onImageSelected={setBuyerAadhaarBack}
          />
        </FormSection>

        <FormSection title="Pricing Details">
          <FormInput
            label="Sale Price (₹)"
            required
            placeholder="Enter sale price"
            keyboardType="number-pad"
            value={salePrice}
            error={showErrors ? errors.salePrice : undefined}
            onChangeText={text => setSalePrice(text.replace(/[^\d]/g, ''))}
          />
          <FormSelect
            label="Payment Mode"
            required
            placeholder="Select payment mode"
            options={PAYMENT_MODE_OPTIONS}
            value={paymentMode}
            error={showErrors ? errors.paymentMode : undefined}
            onChange={setPaymentMode}
          />
          <FormInput
            label="Warranty Period"
            placeholder="e.g., 3 months, 6 months"
            value={warrantyPeriod}
            onChangeText={setWarrantyPeriod}
          />
        </FormSection>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sale Summary</Text>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Final Amount :</Text>
            {selectedDevice ? (
              <Text style={styles.summaryFinalValue}>
                ₹{salePriceNum.toLocaleString('en-IN')}
              </Text>
            ) : null}
          </View>
          {selectedDevice ? (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Purchase Price :</Text>
                <Text style={styles.summaryValue}>
                  ₹{purchasePrice.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Profit :</Text>
                <Text style={styles.summaryProfitValue}>
                  ₹{profit.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Margin :</Text>
                <Text style={styles.summaryMarginValue}>{margin.toFixed(1)}%</Text>
              </View>
            </>
          ) : null}
        </View>

        {submitError ? <Text style={styles.submitErrorText}>{submitError}</Text> : null}
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!canComplete || submitting) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={submitting}>
          <Text style={styles.completeButtonText}>
            {submitting ? 'Completing…' : 'Complete Sale & Generate Invoice'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  deviceCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  deviceCardRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  detailField: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textFaint,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  addressInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: colors.greenDark,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  summaryFinalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  summaryProfitValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#93c5fd',
  },
  summaryMarginValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  submitErrorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  completeButton: {
    backgroundColor: colors.greenDark,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
