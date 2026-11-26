import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePDF } from 'react-native-html-to-pdf';
import Share, { Social } from 'react-native-share';
import { savePdfToDownloads } from '../native/downloads';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';
import { useShopData } from '../context/ShopDataContext';
import { APP_NAME } from '../constants/app';
import { deviceName } from '../utils/format';
import { buildInvoiceHtml, INVOICE_TERMS, shopHeaderLines } from '../utils/invoice';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoicePreview'>;


function formatDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function InvoicePreviewScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { deviceId, customerName, customerMobile, customerAddress, salePrice, warrantyPeriod } =
    route.params;
  const { shop, devices } = useShopData();
  const shopName = shop?.shopName || APP_NAME;
  const shopLines = shopHeaderLines(shop);
  const device = devices.find(d => d.id === deviceId);
  // Both come from the saved sale, so every view and PDF matches.
  const invoiceNumber = device?.invoiceNumber ?? '—';
  const invoiceDate = device?.saleDate ?? formatDate(new Date());
  // Invoice numbers contain "/" (MC/2026-27/0001), which can't be in a file name.
  const invoiceFileName = `Invoice-${invoiceNumber.replace(/[^A-Za-z0-9-]/g, '-')}`;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!device) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Invoice Preview</Text>
        </View>
        <Text style={styles.notFoundText}>Device not found.</Text>
      </SafeAreaView>
    );
  }

  const handleBackToDashboard = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const generateInvoicePdf = async () => {
    const html = buildInvoiceHtml({
      shopName,
      shopLines,
      invoiceNumber,
      invoiceDate,
      device,
      customerName,
      customerMobile,
      customerAddress,
      salePrice,
      warrantyPeriod,
    });
    const { filePath } = await generatePDF({
      html,
      fileName: invoiceFileName,
    });
    return filePath;
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    try {
      const filePath = await generateInvoicePdf();
      await savePdfToDownloads(filePath, invoiceFileName, 'Invoice downloaded');
    } catch (error: any) {
      console.error('Invoice PDF download failed:', error);
      Alert.alert('Download failed', error?.message ?? 'Could not save the invoice PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (isSharing) {
      return;
    }
    setIsSharing(true);
    try {
      const filePath = await generateInvoicePdf();
      await Share.shareSingle({
        social: Social.Whatsapp,
        url: `file://${filePath}`,
        type: 'application/pdf',
        filename: invoiceFileName,
      });
    } catch (error: any) {
      if (!error?.message?.includes('User did not share')) {
        console.error('Invoice WhatsApp share failed:', error);
        Alert.alert(
          'Could not share on WhatsApp',
          error?.message ?? 'Make sure WhatsApp is installed on this device and try again.',
        );
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Invoice Preview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.shopHeader}>
            <View style={styles.shopIconWrap}>
              <InvoiceIcon width={28} height={28} color={colors.primary} />
            </View>
            <Text style={styles.shopName}>{shopName}</Text>
            {shopLines.map(line => (
              <Text key={line} style={styles.shopMeta}>
                {line}
              </Text>
            ))}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.metaLabel}>Invoice Number</Text>
                <Text style={styles.metaValue}>{invoiceNumber}</Text>
              </View>
              <View style={styles.metaRight}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{invoiceDate}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name: </Text>
                <Text style={styles.infoValue}>{customerName}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile: </Text>
                <Text style={styles.infoValue}>{customerMobile}</Text>
              </Text>
              {customerAddress ? (
                <Text style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address: </Text>
                  <Text style={styles.infoValue}>{customerAddress}</Text>
                </Text>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Brand & Model: </Text>
                <Text style={styles.infoValue}>{deviceName(device)}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>IMEI: </Text>
                <Text style={styles.infoValue}>{device.imei1}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Storage: </Text>
                <Text style={styles.infoValue}>{device.storage}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Color: </Text>
                <Text style={styles.infoValue}>{device.color}</Text>
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Sale Price:</Text>
              <Text style={styles.priceValue}>₹{salePrice.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{salePrice.toLocaleString('en-IN')}</Text>
            </View>

            {warrantyPeriod ? (
              <View style={styles.warrantyPill}>
                <Text style={styles.warrantyText}>
                  Warranty: <Text style={styles.warrantyValue}>{warrantyPeriod}</Text>
                </Text>
              </View>
            ) : null}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            {INVOICE_TERMS.map(term => (
              <Text key={term} style={styles.termItem}>
                • {term}
              </Text>
            ))}

            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
              <Text style={styles.signatureShop}>{shopName}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, isDownloading && styles.buttonDisabled]}
          onPress={handleDownloadPdf}
          disabled={isDownloading}>
          <Text style={styles.downloadButtonText}>
            {isDownloading ? 'Generating…' : 'Download PDF'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, isSharing && styles.buttonDisabled]}
          onPress={handleShareWhatsApp}
          disabled={isSharing}>
          <Text style={styles.shareButtonText}>
            {isSharing ? 'Preparing…' : 'Share on WhatsApp'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  shopHeader: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 4,
  },
  shopIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  shopMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  cardBody: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textFaint,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  infoRow: {
    fontSize: 14,
  },
  infoLabel: {
    color: colors.textFaint,
  },
  infoValue: {
    color: colors.text,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.greenDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginVertical: 12,
  },
  warrantyPill: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  warrantyText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  warrantyValue: {
    color: colors.blue,
  },
  termItem: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  signatureBlock: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  signatureLabel: {
    fontSize: 13,
    color: colors.textFaint,
    marginBottom: 4,
  },
  signatureShop: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  shareButton: {
    backgroundColor: colors.greenDark,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  shareButtonText: {
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
});
