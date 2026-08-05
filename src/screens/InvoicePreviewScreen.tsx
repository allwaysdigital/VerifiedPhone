import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePDF } from 'react-native-html-to-pdf';
import Share, { Social } from 'react-native-share';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';
import { useShopData } from '../context/ShopDataContext';
import type { Device } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoicePreview'>;

const SHOP_NAME = 'Mobile Hub';
const SHOP_ADDRESS = '123 Main Street, Mumbai, Maharashtra - 400001';
const SHOP_CONTACT = '+91 98765 43210';
const SHOP_GST = '27AABCU9603R1ZM';

const TERMS = [
  'No returns or exchanges after purchase',
  'Warranty is void if tampered or physically damaged',
  'Keep this invoice for warranty claims',
  'IMEI verified at the time of purchase',
];

function formatDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function buildInvoiceHtml(params: {
  invoiceNumber: string;
  invoiceDate: string;
  device: Device;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  salePrice: number;
  warrantyPeriod: string;
}): string {
  const { invoiceNumber, invoiceDate, device, customerName, customerMobile, customerAddress, salePrice, warrantyPeriod } =
    params;
  const formattedPrice = `₹${salePrice.toLocaleString('en-IN')}`;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #303030; padding: 0; margin: 0; }
          .header { background: ${colors.primary}; color: #fff; text-align: center; padding: 28px 16px; }
          .header h1 { margin: 0 0 6px; font-size: 24px; }
          .header p { margin: 2px 0; font-size: 13px; opacity: 0.9; }
          .body { padding: 20px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .meta-row .label { font-size: 12px; color: #999; margin-bottom: 2px; }
          .meta-row .value { font-size: 16px; font-weight: 700; }
          h2 { font-size: 15px; margin: 0 0 8px; }
          .box { background: #f5f7fa; border-radius: 8px; padding: 12px; margin-bottom: 18px; font-size: 14px; }
          .box p { margin: 4px 0; }
          .box .label { color: #999; }
          .price-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
          .divider { border-top: 1px solid #eee; margin: 12px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; }
          .total-row .value { color: ${colors.greenDark}; }
          .warranty { background: #dbeafe; border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 14px; font-weight: 600; }
          ul { font-size: 12px; color: #666; padding-left: 18px; }
          .signature { text-align: right; margin-top: 30px; }
          .signature .label { font-size: 12px; color: #999; }
          .signature .shop { font-size: 15px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${SHOP_NAME}</h1>
          <p>${SHOP_ADDRESS}</p>
          <p>Contact: ${SHOP_CONTACT}</p>
          <p>GST: ${SHOP_GST}</p>
        </div>
        <div class="body">
          <div class="meta-row">
            <div><div class="label">Invoice Number</div><div class="value">${invoiceNumber}</div></div>
            <div style="text-align:right"><div class="label">Date</div><div class="value">${invoiceDate}</div></div>
          </div>

          <h2>Customer Details</h2>
          <div class="box">
            <p><span class="label">Name:</span> ${customerName}</p>
            <p><span class="label">Mobile:</span> ${customerMobile}</p>
            ${customerAddress ? `<p><span class="label">Address:</span> ${customerAddress}</p>` : ''}
          </div>

          <h2>Product Details</h2>
          <div class="box">
            <p><span class="label">Brand & Model:</span> ${device.model}</p>
            <p><span class="label">IMEI:</span> ${device.imei1}</p>
            <p><span class="label">Storage:</span> ${device.storage}</p>
            <p><span class="label">Color:</span> ${device.color}</p>
          </div>

          <div class="price-row"><span>Sale Price:</span><span>${formattedPrice}</span></div>
          <div class="divider"></div>
          <div class="total-row"><span>Total Amount:</span><span class="value">${formattedPrice}</span></div>

          ${warrantyPeriod ? `<div class="warranty">Warranty: ${warrantyPeriod}</div>` : ''}

          <div class="divider"></div>
          <h2>Terms & Conditions</h2>
          <ul>
            ${TERMS.map(term => `<li>${term}</li>`).join('')}
          </ul>

          <div class="signature">
            <div class="label">Authorized Signature</div>
            <div class="shop">${SHOP_NAME}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default function InvoicePreviewScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { deviceId, customerName, customerMobile, customerAddress, salePrice, warrantyPeriod } =
    route.params;
  const { devices } = useShopData();
  const device = devices.find(d => d.id === deviceId);
  const [invoiceNumber] = useState(() => `SAL${Date.now()}`);
  const [invoiceDate] = useState(() => formatDate(new Date()));
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
      fileName: invoiceNumber,
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
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        filename: invoiceNumber,
        saveToFiles: true,
      });
    } catch (error: any) {
      if (!error?.message?.includes('User did not share')) {
        console.error('Invoice PDF download failed:', error);
        Alert.alert('Download failed', error?.message ?? 'Could not generate the invoice PDF. Please try again.');
      }
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
        filename: invoiceNumber,
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
            <Text style={styles.shopName}>{SHOP_NAME}</Text>
            <Text style={styles.shopMeta}>{SHOP_ADDRESS}</Text>
            <Text style={styles.shopMeta}>Contact: {SHOP_CONTACT}</Text>
            <Text style={styles.shopMeta}>GST: {SHOP_GST}</Text>
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
                <Text style={styles.infoValue}>{device.model}</Text>
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
            {TERMS.map(term => (
              <Text key={term} style={styles.termItem}>
                • {term}
              </Text>
            ))}

            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
              <Text style={styles.signatureShop}>{SHOP_NAME}</Text>
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
