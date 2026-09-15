import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import type { Device } from '../types/domain';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';
import { filterDevices, type StockFilterTab } from '../utils/deviceFilter';

type Props = NativeStackScreenProps<RootStackParamList, 'StockList'>;

type FilterTab = StockFilterTab;
const FILTER_TABS: FilterTab[] = ['All', 'Available', 'Sold'];

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchIconCircle} />
      <View style={styles.searchIconHandle} />
    </View>
  );
}

function borderColorFor(device: Device) {
  if (device.status === 'Sold') return colors.blue;
  if (device.verification === 'Suspicious') return colors.primary;
  return colors.green;
}

function DeviceCard({
  device,
  onPress,
}: {
  device: Device;
  onPress: () => void;
}) {
  const maskedImei = `...${device.imei1.slice(-4)}`;
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColorFor(device) }]}
      onPress={onPress}>
      <View style={styles.cardRow}>
        {device.phoneFrontImageUrl ? (
          <Image source={{ uri: device.phoneFrontImageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder} />
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.model}>{device.model}</Text>
            <Badge
              label={device.status}
              tone={device.status === 'Available' ? 'available' : 'sold'}
            />
          </View>
          <Text style={styles.specs}>
            {device.ram} RAM • {device.storage}
          </Text>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>IMEI</Text>
              <Text style={styles.rowValue}>{maskedImei}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Battery</Text>
              <Text style={styles.rowValue}>{device.batteryHealth}%</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Purchase</Text>
              <Text style={styles.rowValue}>₹{device.purchasePrice.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Expected Sale</Text>
              <Text style={styles.expectedSale}>
                ₹{device.expectedSalePrice.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Badge
            label={device.verification}
            tone={device.verification === 'Verified' ? 'verified' : 'suspicious'}
          />
          <Text style={styles.sellerName}>{device.sellerName}</Text>
        </View>
        {device.status === 'Sold' ? (
          <Text style={styles.profitText}>
            +₹{device.profit.toLocaleString('en-IN')} ({device.profitPercent}%)
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// The searchable, filterable device list — reached either directly (e.g.
// from a Dashboard brand row) or by drilling into a brand from the Stock
// Management overview's grid.
export default function StockListScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterTab>('All');

  // A brand from the grid is a hard lock, not search text — editing or
  // clearing the search box below narrows further within this brand, it
  // never brings other brands back into view.
  const brand = route.params?.brand;

  useEffect(() => {
    if (route.params?.searchQuery) {
      setQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  const filtered = useMemo(
    () => filterDevices(devices, filter, query, brand),
    [devices, filter, query, brand],
  );

  // Reflects whatever's currently on screen — the brand lock (if any), the
  // active Available/Sold tab, and any search text — so the report preview
  // always matches what the dealer is looking at right now.
  const handleOpenReport = () => {
    navigation.navigate('StockReportPreview', { filter, query, brand });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{brand ? `${brand} Stock` : 'Stock List'}</Text>
        <TouchableOpacity style={styles.reportButton} onPress={handleOpenReport}>
          <InvoiceIcon width={14} height={14} color={colors.primary} />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder={brand ? 'Search by IMEI or model' : 'Search by IMEI, brand, or model'}
          placeholderTextColor={colors.textDisabled}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.tabsRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}>
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.countText}>Showing {filtered.length} devices</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <EmptyState
            message={devices.length === 0 ? 'No devices found' : 'No devices match your search'}
          />
        ) : (
          filtered.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onPress={() =>
                navigation.navigate('DeviceDetails', { deviceId: device.id })
              }
            />
          ))
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
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reportButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    width: 16,
    height: 16,
  },
  searchIconCircle: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textDisabled,
  },
  searchIconHandle: {
    position: 'absolute',
    width: 6,
    height: 1.5,
    backgroundColor: colors.textDisabled,
    bottom: 1,
    right: -1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: colors.white,
  },
  countText: {
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  model: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  specs: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
  },
  rowItem: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textFaint,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  expectedSale: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.greenDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginTop: 14,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerName: {
    fontSize: 13,
    color: colors.textMuted,
  },
  profitText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});
