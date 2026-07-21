import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { devices, Device } from '../data/devices';
import Badge from '../components/Badge';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Stock'>,
  NativeStackScreenProps<RootStackParamList>
>;

type FilterTab = 'All' | 'Available' | 'Sold';
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

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Badge
            label={device.verification}
            tone={device.verification === 'Verified' ? 'verified' : 'suspicious'}
          />
          <Text style={styles.sellerName}>{device.sellerName}</Text>
        </View>
        <Text style={styles.profitText}>
          +₹{device.profit.toLocaleString('en-IN')} ({device.profitPercent}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function StockScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterTab>('All');

  const filtered = useMemo(() => {
    return devices.filter(device => {
      if (filter !== 'All' && device.status !== filter) {
        return false;
      }
      if (!query.trim()) {
        return true;
      }
      const q = query.trim().toLowerCase();
      return (
        device.imei1.includes(q) ||
        device.brand.toLowerCase().includes(q) ||
        device.model.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Stock Management</Text>

      <View style={styles.searchRow}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by IMEI, brand, or model"
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
        {filtered.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onPress={() =>
              navigation.navigate('DeviceDetails', { deviceId: device.id })
            }
          />
        ))}
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
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    color: colors.text,
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
