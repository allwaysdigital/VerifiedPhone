import React, { useRef, useState } from 'react';
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
import { FormCheckbox } from '../components/FormControls';
import SignaturePad, { SignaturePadHandle } from '../components/SignaturePad';
import { useShopData } from '../context/ShopDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'DigitalSignature'>;

export default function DigitalSignatureScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { createDevice } = useShopData();
  const { purchaseData } = route.params;
  const [confirmed, setConfirmed] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const padRef = useRef<SignaturePadHandle>(null);

  const isDeclarationComplete = confirmed && !signatureEmpty;
  const canSave = isDeclarationComplete && !saving;

  const handleSaveSeller = async () => {
    if (!canSave) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createDevice({
        brand: purchaseData.brand,
        model: purchaseData.model,
        color: purchaseData.color,
        ram: purchaseData.ram,
        storage: purchaseData.storage,
        condition: purchaseData.condition,
        batteryHealth: purchaseData.batteryHealth,
        imei1: purchaseData.imei1,
        imei2: purchaseData.imei2,
        purchasePrice: purchaseData.purchasePrice,
        expectedSalePrice: purchaseData.expectedSale,
        accessories: purchaseData.accessories,
        sellerName: purchaseData.fullName,
        sellerMobile: purchaseData.mobileNumber,
        sellerAddress: purchaseData.address,
        sellerCity: purchaseData.city,
        sellerDeclarationConfirmed: true,
        phoneFrontImageUri: purchaseData.phoneFrontImage,
        phoneBackImageUri: purchaseData.phoneBackImage,
        oldPhoneBillUri: purchaseData.oldPhoneBill,
        aadhaarFrontUri: purchaseData.aadhaarFront,
        aadhaarBackUri: purchaseData.aadhaarBack,
      });
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err) {
      setError('Could not save this purchase. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Digital Signature</Text>
            <TouchableOpacity
              style={styles.clearRow}
              onPress={() => {
                padRef.current?.clear();
                setSignatureEmpty(true);
              }}>
              <Text style={styles.clearText}>✕ Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.padWrap}>
            <SignaturePad ref={padRef} onChange={setSignatureEmpty} />
          </View>
          <Text style={styles.hint}>Sign above with your finger or mouse</Text>
        </View>

        <View style={styles.confirmCard}>
          <FormCheckbox
            label="I confirm this device is legally owned by me and not stolen, lost, or involved in any illegal activity."
            required
            checked={confirmed}
            onToggle={() => setConfirmed(v => !v)}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSaveSeller}
            disabled={!canSave}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Seller'}</Text>
          </TouchableOpacity>
        </View>
        {!isDeclarationComplete ? (
          <Text style={styles.validationHint}>
            {signatureEmpty && !confirmed
              ? 'Please sign above and confirm the declaration to continue.'
              : signatureEmpty
              ? 'Please sign above to continue.'
              : 'Please confirm the declaration to continue.'}
          </Text>
        ) : null}
        {error ? <Text style={styles.validationHint}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearText: {
    color: colors.pink,
    fontSize: 15,
    fontWeight: '500',
  },
  padWrap: {
    height: 420,
  },
  hint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  confirmCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  validationHint: {
    textAlign: 'center',
    color: colors.danger,
    fontSize: 13,
    marginTop: 12,
  },
});
