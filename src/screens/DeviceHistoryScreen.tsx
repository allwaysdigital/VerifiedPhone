import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { formatINR } from '../utils/format';
import { parseDMY } from '../utils/date';
import BackButton from '../components/BackButton';
import type { Device } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceHistory'>;

// The app doesn't merge repeat purchases of the same handset into one
// record — buying a phone back after selling it just creates another
// Device row with the same IMEI. This screen is the read side of that:
// pull every row sharing an IMEI and lay them out oldest-first so the
// dealer can see the full "bought, sold, bought again…" life of a phone.
export default function DeviceHistoryScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const { imei1 } = route.params;

  const cycles = useMemo(() => {
    if (!imei1) {
      return [];
    }
    return devices
      .filter(d => d.imei1 === imei1)
      .sort((a, b) => {
        const aTime = parseDMY(a.purchaseDate)?.getTime() ?? 0;
        const bTime = parseDMY(b.purchaseDate)?.getTime() ?? 0;
        return aTime - bTime;
      });
  }, [devices, imei1]);

  const latest = cycles[cycles.length - 1];
  const timesSold = cycles.filter(c => c.status === 'Sold').length;
  const totalProfit = cycles
    .filter(c => c.status === 'Sold')
    .reduce((sum, c) => sum + c.profit, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Phone History</Text>
      </View>

      {!latest ? (
        <Text style={styles.emptyText}>No history found for this IMEI.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryModel}>
              {latest.brand} {latest.model}
            </Text>
            <Text style={styles.summaryImei}>IMEI: {imei1}</Text>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{cycles.length}</Text>
                <Text style={styles.summaryStatLabel}>Times Purchased</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{timesSold}</Text>
                <Text style={styles.summaryStatLabel}>Times Sold</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{formatINR(totalProfit)}</Text>
                <Text style={styles.summaryStatLabel}>Total Profit</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeline}>
            {cycles.map((cycle, index) => (
              <TimelineEntry
                key={cycle.id}
                cycle={cycle}
                cycleNumber={index + 1}
                isLast={index === cycles.length - 1}
                onPress={() => navigation.push('DeviceDetails', { deviceId: cycle.id })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TimelineEntry({
  cycle,
  cycleNumber,
  isLast,
  onPress,
}: {
  cycle: Device;
  cycleNumber: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const isSold = cycle.status === 'Sold';
  return (
    <View style={styles.entryRow}>
      <View style={styles.entryRail}>
        <View style={[styles.entryDot, isSold ? styles.entryDotSold : styles.entryDotAvailable]} />
        {!isLast ? <View style={styles.entryLine} /> : null}
      </View>

      <TouchableOpacity style={styles.entryCard} activeOpacity={0.8} onPress={onPress}>
        <View style={styles.entryHeaderRow}>
          <Text style={styles.entryTitle}>Purchase #{cycleNumber}</Text>
          <View
            style={[
              styles.entryStatusChip,
              { backgroundColor: isSold ? colors.blue : colors.green },
            ]}>
            <Text style={styles.entryStatusText}>
              {isSold ? 'Sold' : 'Currently in Stock'}
            </Text>
          </View>
        </View>

        <View style={styles.entrySection}>
          <Text style={styles.entryLabel}>Purchased {cycle.purchaseDate}</Text>
          <Text style={styles.entryValue}>
            From {cycle.sellerName || '—'} ({cycle.sellerMobile || '—'})
          </Text>
          <Text style={styles.entryValue}>{formatINR(cycle.purchasePrice)}</Text>
        </View>

        {isSold ? (
          <View style={styles.entrySection}>
            <Text style={styles.entryLabel}>Sold {cycle.saleDate ?? ''}</Text>
            <Text style={styles.entryValue}>
              To {cycle.buyerName || '—'} ({cycle.buyerMobile || '—'})
            </Text>
            <View style={styles.entrySaleRow}>
              <Text style={styles.entryValue}>{formatINR(cycle.salePrice ?? 0)}</Text>
              <Text
                style={[
                  styles.entryProfit,
                  { color: cycle.profit >= 0 ? colors.greenDark : colors.danger },
                ]}>
                {cycle.profit >= 0 ? '+' : ''}
                {formatINR(cycle.profit)}
              </Text>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
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
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 14,
    marginTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  summaryModel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  summaryImei: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 14,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  summaryStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    textAlign: 'center',
  },
  timeline: {
    marginTop: 20,
  },
  entryRow: {
    flexDirection: 'row',
  },
  entryRail: {
    width: 24,
    alignItems: 'center',
  },
  entryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  entryDotAvailable: {
    backgroundColor: colors.green,
  },
  entryDotSold: {
    backgroundColor: colors.blue,
  },
  entryLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  entryCard: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  entryStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  entryStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  entrySection: {
    marginBottom: 8,
  },
  entryLabel: {
    fontSize: 11,
    color: colors.textFaint,
    marginBottom: 2,
  },
  entryValue: {
    fontSize: 13.5,
    color: colors.text,
    fontWeight: '500',
  },
  entrySaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  entryProfit: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
