import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { formatINR } from '../utils/format';
import { parseDMY } from '../utils/date';
import type { Device } from '../types/domain';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseList' | 'SaleList' | 'ProfitList'>;

type Mode = 'purchase' | 'sale' | 'profit';

const MODE_BY_ROUTE: Record<string, Mode> = {
  PurchaseList: 'purchase',
  SaleList: 'sale',
  ProfitList: 'profit',
};

const MODE_META: Record<
  Mode,
  {
    title: string;
    accent: string;
    summaryLabel: string;
    summaryValue: (devices: Device[]) => number;
    summaryCaption: (count: number) => string;
    emptyMessage: string;
    searchPlaceholder: string;
  }
> = {
  purchase: {
    title: 'Purchase History',
    accent: colors.purple,
    summaryLabel: 'Total Purchases',
    summaryValue: devices => devices.reduce((sum, d) => sum + d.purchasePrice, 0),
    summaryCaption: count => `${count} device${count === 1 ? '' : 's'} purchased`,
    emptyMessage: 'No purchases yet',
    searchPlaceholder: 'Search by model, brand, IMEI, or seller',
  },
  sale: {
    title: 'Sale History',
    accent: colors.greenDark,
    summaryLabel: 'Total Sales',
    summaryValue: devices => devices.reduce((sum, d) => sum + (d.salePrice ?? 0), 0),
    summaryCaption: count => `${count} device${count === 1 ? '' : 's'} sold`,
    emptyMessage: 'No sales yet',
    searchPlaceholder: 'Search by model, brand, IMEI, or buyer',
  },
  profit: {
    title: 'Profit Overview',
    accent: colors.green,
    summaryLabel: 'Total Profit',
    summaryValue: devices => devices.reduce((sum, d) => sum + d.profit, 0),
    summaryCaption: count => `Across ${count} sold device${count === 1 ? '' : 's'}`,
    emptyMessage: 'No profit recorded yet',
    searchPlaceholder: 'Search by model, brand, or IMEI',
  },
};

function timeValue(dateStr?: string): number {
  return parseDMY(dateStr)?.getTime() ?? 0;
}

function selectDevices(mode: Mode, devices: Device[]): Device[] {
  if (mode === 'purchase') {
    return [...devices].sort((a, b) => timeValue(b.purchaseDate) - timeValue(a.purchaseDate));
  }
  const sold = devices.filter(d => d.status === 'Sold');
  if (mode === 'sale') {
    return sold.sort((a, b) => timeValue(b.saleDate) - timeValue(a.saleDate));
  }
  return sold.sort((a, b) => b.profit - a.profit);
}

function matchesQuery(device: Device, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    device.imei1.includes(q) ||
    device.brand.toLowerCase().includes(q) ||
    device.model.toLowerCase().includes(q) ||
    device.sellerName.toLowerCase().includes(q) ||
    (device.buyerName ?? '').toLowerCase().includes(q)
  );
}

function TransactionRow({
  mode,
  device,
  onPress,
}: {
  mode: Mode;
  device: Device;
  onPress: () => void;
}) {
  const amount =
    mode === 'purchase'
      ? { text: formatINR(device.purchasePrice), color: colors.text }
      : mode === 'sale'
      ? { text: formatINR(device.salePrice ?? 0), color: colors.greenDark }
      : {
          text: `${device.profit >= 0 ? '+' : ''}${formatINR(device.profit)}`,
          color: device.profit >= 0 ? colors.greenDark : colors.danger,
        };

  const meta =
    mode === 'purchase'
      ? `Purchased ${device.purchaseDate || '—'} • ${device.sellerName}`
      : mode === 'sale'
      ? `Sold ${device.saleDate || '—'} • ${device.buyerName || 'Buyer not recorded'}`
      : `${device.profitPercent}% margin • Sold ${device.saleDate || '—'}`;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowTopLine}>
        <Text style={styles.rowModel} numberOfLines={1}>
          {device.brand} {device.model}
        </Text>
        <Text style={[styles.rowAmount, { color: amount.color }]}>{amount.text}</Text>
      </View>
      <Text style={styles.rowMeta} numberOfLines={1}>
        {meta}
      </Text>
    </TouchableOpacity>
  );
}

export default function TransactionListScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const [query, setQuery] = useState('');

  const mode = MODE_BY_ROUTE[route.name];
  const meta = MODE_META[mode];

  const scoped = useMemo(() => selectDevices(mode, devices), [mode, devices]);
  const filtered = useMemo(() => scoped.filter(d => matchesQuery(d, query)), [scoped, query]);
  const summaryTotal = useMemo(() => meta.summaryValue(scoped), [meta, scoped]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{meta.title}</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: meta.accent }]}>
        <Text style={styles.summaryLabel}>{meta.summaryLabel}</Text>
        <Text style={styles.summaryValue}>{formatINR(summaryTotal)}</Text>
        <Text style={styles.summaryCaption}>{meta.summaryCaption(scoped.length)}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder={meta.searchPlaceholder}
        placeholderTextColor={colors.textDisabled}
        value={query}
        onChangeText={setQuery}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <EmptyState message={scoped.length === 0 ? meta.emptyMessage : 'No matches for your search'} />
        ) : (
          <View style={styles.listCard}>
            {filtered.map((device, index) => (
              <React.Fragment key={device.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <TransactionRow
                  mode={mode}
                  device={device}
                  onPress={() =>
                    mode === 'sale'
                      ? navigation.navigate('InvoicePreview', {
                          deviceId: device.id,
                          customerName: device.buyerName ?? '',
                          customerMobile: device.buyerMobile ?? '',
                          customerAddress: device.buyerAddress ?? '',
                          salePrice: device.salePrice ?? device.expectedSalePrice,
                          warrantyPeriod: device.warrantyPeriod ?? '',
                        })
                      : navigation.navigate('DeviceDetails', { deviceId: device.id })
                  }
                />
              </React.Fragment>
            ))}
          </View>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  summaryValue: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
    marginTop: 6,
  },
  summaryCaption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowModel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginHorizontal: 16,
  },
});
