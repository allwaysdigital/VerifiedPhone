import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';
import { useShopData } from '../context/ShopDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PoliceExportRecord'>;

const VERIFICATION_DOCUMENTS = [
  { label: 'Aadhaar Card (Front & Back)', status: 'Verified' },
  { label: 'Seller Live Photo', status: 'Captured' },
  { label: 'Digital Signature', status: 'Signed' },
  { label: 'Device Images', status: 'Uploaded' },
];

function DeviceField({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function formatDateTime(date: Date): string {
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}

export default function PoliceExportRecordScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const device = devices.find(d => d.id === route.params.deviceId);
  const [recordGenerated] = useState(() => formatDateTime(new Date()));

  if (!device) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Police Export Record</Text>
        </View>
        <Text style={styles.notFoundText}>Device not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <View>
          <Text style={styles.headerTitle}>Police Export Record</Text>
          <Text style={styles.headerSubtitle}>Confidential Document</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠ This document contains sensitive information. Handle with care and share only with
            authorized personnel.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <InvoiceIcon width={22} height={22} color={colors.primary} />
            <Text style={styles.cardTitle}>Complete Purchase Record</Text>
          </View>
          <View style={styles.cardHeaderDivider} />

          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.infoBox}>
            <DeviceField label="Brand & Model :" value={device.model} />
            <DeviceField label="IMEI 1 :" value={device.imei1} />
            <DeviceField label="Color :" value={device.color} />
            <DeviceField label="Storage :" value={device.storage} />
            <DeviceField label="Purchase Date :" value={device.purchaseDate} />
            <DeviceField
              label="IMEI Status :"
              value={device.verification}
              valueColor={device.verification === 'Verified' ? colors.green : colors.danger}
            />
          </View>

          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.infoBox}>
            <DeviceField label="Full Name :" value={device.sellerName} />
            <DeviceField label="Mobile :" value={device.sellerMobile} />
            {device.sellerAltMobile ? (
              <DeviceField label="Alt. Mobile :" value={device.sellerAltMobile} />
            ) : null}
            {device.sellerAddress ? (
              <DeviceField label="Address :" value={device.sellerAddress} />
            ) : null}
            <DeviceField label="City :" value={device.sellerCity} />
            {device.sellerState ? <DeviceField label="State :" value={device.sellerState} /> : null}
            {device.sellerPincode ? (
              <DeviceField label="Pincode :" value={device.sellerPincode} />
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Verification Documents</Text>
          {VERIFICATION_DOCUMENTS.map(doc => (
            <View key={doc.label} style={styles.docRow}>
              <Text style={styles.docLabel}>✓ {doc.label}</Text>
              <Text style={styles.docStatus}>{doc.status}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Legal Declaration</Text>
          <View style={styles.declarationBox}>
            <Text style={styles.declarationText}>
              ✓ Seller has declared that this device is legally owned and not stolen, lost, or
              involved in any illegal activity.
            </Text>
            <Text style={styles.declarationDate}>
              Declaration Date: {device.declarationDate ?? device.purchaseDate}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Record Timestamp</Text>
          <View style={styles.timestampBox}>
            <Text style={styles.timestampText}>Record Generated: {recordGenerated}</Text>
            <Text style={styles.timestampText}>
              Purchase Timestamp: {device.purchaseDate}
              {device.purchaseTime ? `, ${device.purchaseTime}` : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download as PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          This document is generated automatically and contains all verification details for legal
          compliance.
        </Text>
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
  headerSubtitle: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 2,
  },
  notFoundText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: colors.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  warningBanner: {
    backgroundColor: 'rgba(236,77,81,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(236,77,81,0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 19,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardHeaderDivider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginTop: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textFaint,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flexShrink: 1,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  docStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.blue,
  },
  declarationBox: {
    backgroundColor: 'rgba(52,199,89,0.12)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  declarationText: {
    fontSize: 14,
    color: colors.greenDark,
    lineHeight: 20,
    fontWeight: '500',
  },
  declarationDate: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 8,
  },
  timestampBox: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  timestampText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  downloadButton: {
    backgroundColor: colors.danger,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footerText: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
