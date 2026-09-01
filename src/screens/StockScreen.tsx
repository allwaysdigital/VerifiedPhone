import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import EmptyState from '../components/EmptyState';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';
import { getBrandColor } from '../utils/brandColors';
import { formatINR } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Stock'>;

type BrandStat = { brand: string; count: number; color: string };

function BrandChip({ stat, onPress }: { stat: BrandStat; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.brandChip} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.brandChipAvatar, { backgroundColor: stat.color }]}>
        <Text style={styles.brandChipAvatarText}>{stat.count}</Text>
      </View>
      <Text style={styles.brandChipLabel} numberOfLines={1}>
        {stat.brand}
      </Text>
    </TouchableOpacity>
  );
}

// The overview: header stats + a brand-by-brand breakdown of what's
// currently available. Tapping a brand drills into StockList, which has
// the actual searchable, filterable device list.
export default function StockScreen({ navigation }: Props) {
  useScreenStatusBar('light-content', colors.primary);
  const { devices, brands } = useShopData();

  // "Stock" means what's currently available to sell, so both the header
  // stats and the brand breakdown only count Available devices — the same
  // definition the Dashboard's "Total Stock" card already uses.
  const availableDevices = useMemo(() => devices.filter(d => d.status === 'Available'), [devices]);

  const totalStockUnits = availableDevices.length;
  const totalStockValue = useMemo(
    () => availableDevices.reduce((sum, d) => sum + d.purchasePrice, 0),
    [availableDevices],
  );

  const catalogBrandNames = useMemo(() => brands.map(b => b.name), [brands]);

  const brandStats = useMemo<BrandStat[]>(() => {
    const byBrand = new Map<string, number>();
    availableDevices.forEach(device => {
      byBrand.set(device.brand, (byBrand.get(device.brand) ?? 0) + 1);
    });
    return Array.from(byBrand.entries())
      .map(([brand, count]) => ({ brand, count, color: getBrandColor(brand, catalogBrandNames) }))
      .sort((a, b) => b.count - a.count);
  }, [availableDevices, catalogBrandNames]);

  const handleBrandChipPress = (brand: string) => {
    navigation.navigate('StockList', { brand });
  };

  // From the overview there's no active filter to reflect, so this is
  // always a whole-store report. StockList has its own Report button that
  // reflects whatever's currently searched/filtered there instead.
  const handleOpenReport = () => {
    navigation.navigate('StockReportPreview', { filter: 'All', query: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerHero}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} color={colors.white} />
          <Text style={styles.headerTitle}>Stock Management</Text>
          <TouchableOpacity style={styles.reportButton} onPress={handleOpenReport}>
            <InvoiceIcon width={14} height={14} color={colors.white} />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statChipRow}>
          <View style={styles.statChip}>
            <Text style={styles.statChipLabel}>Total Stock</Text>
            <Text style={styles.statChipValue}>{totalStockUnits} units</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipLabel}>Stock Value</Text>
            <Text style={styles.statChipValue}>{formatINR(totalStockValue)}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandSection}>
          <Text style={styles.sectionTitle}>Brand-wise Stock</Text>
          {brandStats.length === 0 ? (
            <EmptyState message="No stock yet" />
          ) : (
            <>
              <View style={styles.stackBar}>
                {brandStats.map((stat, index) => (
                  <View
                    key={stat.brand}
                    style={[
                      styles.stackSegment,
                      {
                        flex: stat.count,
                        backgroundColor: stat.color,
                        marginRight: index === brandStats.length - 1 ? 0 : 2,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.stackCaption}>
                {totalStockUnits} device{totalStockUnits === 1 ? '' : 's'} across {brandStats.length}{' '}
                brand{brandStats.length === 1 ? '' : 's'}
              </Text>

              <View style={styles.brandGrid}>
                {brandStats.map(stat => (
                  <BrandChip
                    key={stat.brand}
                    stat={stat}
                    onPress={() => handleBrandChipPress(stat.brand)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerHero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  statChipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 12,
    padding: 12,
  },
  statChipLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
  },
  statChipValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  brandSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  stackBar: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
  },
  stackSegment: {
    height: '100%',
  },
  stackCaption: {
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 8,
    textAlign: 'center',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 18,
    rowGap: 16,
  },
  brandChip: {
    width: '33.33%',
    alignItems: 'center',
    gap: 6,
  },
  brandChipAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandChipAvatarText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  brandChipLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
