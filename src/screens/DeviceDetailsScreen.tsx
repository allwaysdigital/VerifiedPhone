import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
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

// One slide of the front/back photo carousel at the top of the screen.
type CarouselImage = { key: string; label: string; uri: string };

// Labeled thumbnail for a single uploaded document (bill, Aadhaar, etc).
// Renders a muted "Not uploaded" placeholder instead of an empty box when
// that particular image was never captured during purchase.
function DocumentThumb({
  label,
  uri,
  onPress,
}: {
  label: string;
  uri?: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.docThumb}
      disabled={!uri}
      onPress={onPress}
      activeOpacity={0.8}>
      {uri ? (
        <Image source={{ uri }} style={styles.docThumbImage} resizeMode="cover" />
      ) : (
        <Text style={styles.docThumbEmptyText}>Not uploaded</Text>
      )}
      <Text style={styles.docThumbLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DeviceDetailsScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const device = devices.find(d => d.id === route.params.deviceId);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const carouselWidth = windowWidth - 32; // matches scrollContent's 16px horizontal padding

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

  // Every purchase of a phone (even a repeat buy after it was sold) gets
  // its own Device row sharing the same IMEI — this counts how many rows
  // that adds up to, so the history link only shows up once there's an
  // actual story to tell.
  const historyCount = device.imei1
    ? devices.filter(d => d.imei1 === device.imei1).length
    : 0;

  // Only the images that were actually uploaded become slides — a device
  // purchased with just a front photo gets a single, non-paging slide.
  const carouselImages: CarouselImage[] = [
    device.phoneFrontImageUrl ? { key: 'front', label: 'Front', uri: device.phoneFrontImageUrl } : null,
    device.phoneBackImageUrl ? { key: 'back', label: 'Back', uri: device.phoneBackImageUrl } : null,
  ].filter((item): item is CarouselImage => item !== null);

  // pagingEnabled snaps scroll position to whole multiples of the slide
  // width, so dividing back out gives us which slide is now active.
  const handleCarouselScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / carouselWidth);
    setCarouselIndex(index);
  };

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
        {carouselImages.length > 0 ? (
          <View>
            <FlatList
              data={carouselImages}
              keyExtractor={item => item.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleCarouselScrollEnd}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.carouselItem, { width: carouselWidth }]}
                  onPress={() => setPreviewUri(item.uri)}>
                  <Image source={{ uri: item.uri }} style={styles.carouselImage} resizeMode="cover" />
                  <Text style={styles.carouselLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            {carouselImages.length > 1 ? (
              <View style={styles.dotsRow}>
                {carouselImages.map((item, index) => (
                  <View
                    key={item.key}
                    style={[styles.dot, index === carouselIndex && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <PhoneIcon />
            <Text style={styles.imagePlaceholderText}>Device Image</Text>
          </View>
        )}

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

        {historyCount > 1 ? (
          <TouchableOpacity
            style={styles.historyButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DeviceHistory', { imei1: device.imei1 })}>
            <Text style={styles.historyButtonText}>
              View Full Purchase &amp; Sale History ({historyCount})
            </Text>
            <Text style={styles.historyButtonArrow}>›</Text>
          </TouchableOpacity>
        ) : null}

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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.docsGrid}>
            <DocumentThumb
              label="Old Bill"
              uri={device.oldPhoneBillUrl}
              onPress={() => setPreviewUri(device.oldPhoneBillUrl ?? null)}
            />
            <DocumentThumb
              label="Aadhaar Front"
              uri={device.aadhaarFrontUrl}
              onPress={() => setPreviewUri(device.aadhaarFrontUrl ?? null)}
            />
            <DocumentThumb
              label="Aadhaar Back"
              uri={device.aadhaarBackUrl}
              onPress={() => setPreviewUri(device.aadhaarBackUrl ?? null)}
            />
          </View>
        </View>

        {isSold ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sale Information</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Sale Price</Text>
              <Text style={[styles.priceValue, { color: colors.greenDark }]}>
                ₹{(device.salePrice ?? 0).toLocaleString('en-IN')}
              </Text>
            </View>
            {device.saleDate ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Sale Date</Text>
                <Text style={styles.sellerValue}>{device.saleDate}</Text>
              </View>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Buyer Name</Text>
              <Text style={styles.sellerValue}>{device.buyerName || '—'}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Buyer Mobile</Text>
              <Text style={styles.sellerValue}>{device.buyerMobile || '—'}</Text>
            </View>
            {device.warrantyPeriod ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Warranty</Text>
                <Text style={styles.sellerValue}>{device.warrantyPeriod}</Text>
              </View>
            ) : null}
            <View style={styles.docsGrid}>
              <DocumentThumb
                label="Buyer Aadhaar Front"
                uri={device.buyerAadhaarFrontUrl}
                onPress={() => setPreviewUri(device.buyerAadhaarFrontUrl ?? null)}
              />
              <DocumentThumb
                label="Buyer Aadhaar Back"
                uri={device.buyerAadhaarBackUrl}
                onPress={() => setPreviewUri(device.buyerAadhaarBackUrl ?? null)}
              />
            </View>
          </View>
        ) : null}

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

      {/* Shared full-screen viewer — opened by tapping either a carousel
          slide or a document thumbnail below. */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}>
        <TouchableOpacity
          style={styles.previewBackdrop}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </TouchableOpacity>
      </Modal>
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
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  historyButtonArrow: {
    fontSize: 20,
    color: colors.primary,
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
  carouselItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 260,
  },
  carouselLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  docsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  docThumb: {
    width: '47%',
    height: 110,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docThumbImage: {
    width: '100%',
    height: '100%',
  },
  docThumbLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 4,
    textAlign: 'center',
  },
  docThumbEmptyText: {
    fontSize: 13,
    color: colors.textFaint,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
});
