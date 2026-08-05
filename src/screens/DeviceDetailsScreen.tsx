import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import Badge from '../components/Badge';
import BackButton from '../components/BackButton';
import UploadIcon from '../assets/icons/upload_icon.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

function PhoneIcon() {
  return (
    <View style={styles.phoneIconOuter}>
      <View style={styles.phoneIconNotch} />
    </View>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function DeviceDetailsScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const device = devices.find(d => d.id === route.params.deviceId);

  if (!device) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Device Details</Text>
        </View>
        <Text style={styles.notFoundText}>Device not found.</Text>
      </SafeAreaView>
    );
  }

  const isSold = device.status === 'Sold';

  const handleMarkAsSold = () => {
    navigation.navigate('AddSale', { deviceId: device.id });
  };

  const handleDownloadInvoice = () => {
    navigation.navigate('InvoicePreview', {
      deviceId: device.id,
      customerName: device.buyerName ?? '',
      customerMobile: device.buyerMobile ?? '',
      customerAddress: device.buyerAddress ?? '',
      salePrice: device.salePrice ?? device.expectedSalePrice,
      warrantyPeriod: device.warrantyPeriod ?? '',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Device Details</Text>
        <TouchableOpacity hitSlop={12}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imagePlaceholder}>
          <PhoneIcon />
          <Text style={styles.imagePlaceholderText}>Device Image</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.modelName}>{device.model}</Text>
            <Badge
              label={device.status}
              tone={device.status === 'Available' ? 'available' : 'sold'}
            />
          </View>

          <View style={styles.fieldsRow}>
            <DetailField label="Color" value={device.color} />
            <DetailField label="Condition" value={device.condition} />
          </View>
          <View style={styles.fieldsRow}>
            <DetailField label="RAM" value={device.ram} />
            <DetailField label="Storage" value={device.storage} />
          </View>
          <View style={styles.fieldsRow}>
            <DetailField label="Battery Health" value={`${device.batteryHealth}%`} />
            <DetailField label="Purchase Date" value={device.purchaseDate} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.accessoriesLabel}>Accessories</Text>
          <View style={styles.chipsRow}>
            {device.accessories.map(item => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>IMEI Information</Text>
          <View style={styles.imeiRow}>
            <View>
              <Text style={styles.detailLabel}>IMEI 1</Text>
              <Text style={styles.detailValue}>{device.imei1}</Text>
            </View>
            <Badge
              label={device.verification}
              tone={device.verification === 'Verified' ? 'verified' : 'suspicious'}
            />
          </View>
          {device.imei2 ? (
            <View style={[styles.imeiRow, styles.imeiRowSpacing]}>
              <View>
                <Text style={styles.detailLabel}>IMEI 2</Text>
                <Text style={styles.detailValue}>{device.imei2}</Text>
              </View>
              <Badge
                label={device.verification}
                tone={device.verification === 'Verified' ? 'verified' : 'suspicious'}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing Information</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Purchase Price</Text>
            <Text style={styles.priceValue}>
              ₹{device.purchasePrice.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Expected Sale Price</Text>
            <Text style={[styles.priceValue, { color: colors.greenDark }]}>
              ₹{device.expectedSalePrice.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Expected Profit</Text>
            <Text style={styles.profitValue}>
              ₹{device.profit.toLocaleString('en-IN')} ({device.profitPercent}%)
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Name</Text>
            <Text style={styles.sellerValue}>{device.sellerName}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Mobile no.</Text>
            <Text style={styles.sellerValue}>{device.sellerMobile}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>City</Text>
            <Text style={styles.sellerValue}>{device.sellerCity}</Text>
          </View>
        </View>

        {isSold ? (
          <>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('PoliceExportRecord', { deviceId: device.id })}>
              <UploadIcon width={18} height={18} />
              <Text style={styles.outlineButtonText}>Police Export Record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={handleDownloadInvoice}>
              <UploadIcon width={18} height={18} />
              <Text style={styles.outlineButtonText}>Download Invoice</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleMarkAsSold}>
              <Text style={styles.primaryButtonText}>Mark as sold</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton}>
              <UploadIcon width={18} height={18} />
              <Text style={styles.outlineButtonText}>Export Consent Letter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton}>
              <UploadIcon width={18} height={18} />
              <Text style={styles.outlineButtonText}>View Documents</Text>
            </TouchableOpacity>
          </>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  editIcon: {
    fontSize: 20,
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
    gap: 16,
  },
  imagePlaceholder: {
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  phoneIconOuter: {
    width: 40,
    height: 64,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: colors.textDisabled,
    alignItems: 'center',
  },
  phoneIconNotch: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textDisabled,
    marginTop: 6,
  },
  imagePlaceholderText: {
    fontSize: 15,
    color: colors.textMuted,
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modelName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  fieldsRow: {
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
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginVertical: 12,
  },
  accessoriesLabel: {
    fontSize: 12,
    color: colors.textFaint,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 13,
    color: colors.blue,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  imeiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 12,
  },
  imeiRowSpacing: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 15,
    color: colors.textMuted,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
  },
  sellerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.greenDark,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
