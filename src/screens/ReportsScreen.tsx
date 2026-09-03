import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { formatINR, formatLakhs, profitLossLabel } from '../utils/format';
import { parseDMY } from '../utils/date';
import type { Device } from '../types/domain';
import BarChart, { ChartSeries } from '../components/BarChart';

type Period = 'Daily' | 'Monthly' | 'Yearly';
const PERIODS: Period[] = ['Daily', 'Monthly', 'Yearly'];

type PeriodData = {
  purchaseLabel: string;
  purchaseValue: string;
  purchaseCaption: string;
  saleLabel: string;
  saleValue: string;
  saleCaption: string;
  netProfit: string;
  netProfitLabel: string;
  isNetLoss: boolean;
  chartTitle: string;
  categories: string[];
  yMax: number;
  yStep: number;
  purchase: number[];
  sale: number[];
  profit: number[];
};

const PERIOD_META: Record<
  Period,
  { purchaseLabel: string; saleLabel: string; chartTitle: string; bucketCount: number; formatValue: (n: number) => string }
> = {
  Daily: {
    purchaseLabel: 'Total Purchase',
    saleLabel: 'Total Sale',
    chartTitle: 'Last 7 Days Trend',
    bucketCount: 7,
    formatValue: formatINR,
  },
  Monthly: {
    purchaseLabel: 'This Month Purchase',
    saleLabel: 'This Month Sale',
    chartTitle: 'Last 6 Months Trend',
    bucketCount: 6,
    formatValue: formatLakhs,
  },
  Yearly: {
    purchaseLabel: 'This Year Purchase',
    saleLabel: 'This Year Sale',
    chartTitle: 'Last 5 Years Trend',
    bucketCount: 5,
    formatValue: formatLakhs,
  },
};

function niceYAxis(maxValue: number): { yMax: number; yStep: number } {
  const safeMax = Math.max(maxValue, 4);
  const yMax = Math.ceil((safeMax * 1.2) / 4) * 4;
  return { yMax, yStep: yMax / 4 };
}

function buildPeriodData(period: Period, devices: Device[]): PeriodData {
  const meta = PERIOD_META[period];
  const now = new Date();
  let categories: string[];
  let bucketIndex: (date: Date) => number;

  if (period === 'Daily') {
    const days: Date[] = Array.from({ length: meta.bucketCount }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (meta.bucketCount - 1 - i));
      return d;
    });
    categories = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
    bucketIndex = date => days.findIndex(d => d.toDateString() === date.toDateString());
  } else if (period === 'Monthly') {
    const months: Date[] = Array.from(
      { length: meta.bucketCount },
      (_, i) => new Date(now.getFullYear(), now.getMonth() - (meta.bucketCount - 1 - i), 1),
    );
    categories = months.map(d => d.toLocaleDateString('en-US', { month: 'short' }));
    bucketIndex = date =>
      months.findIndex(d => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth());
  } else {
    const years: number[] = Array.from(
      { length: meta.bucketCount },
      (_, i) => now.getFullYear() - (meta.bucketCount - 1 - i),
    );
    categories = years.map(String);
    bucketIndex = date => years.indexOf(date.getFullYear());
  }

  const purchase = new Array(categories.length).fill(0);
  const sale = new Array(categories.length).fill(0);
  const profit = new Array(categories.length).fill(0);
  let purchaseCount = 0;
  let saleCount = 0;

  devices.forEach(device => {
    const purchaseDate = parseDMY(device.purchaseDate);
    if (purchaseDate) {
      const idx = bucketIndex(purchaseDate);
      if (idx >= 0) {
        purchase[idx] += device.purchasePrice;
        purchaseCount += 1;
      }
    }
    if (device.status === 'Sold') {
      const saleDate = parseDMY(device.saleDate);
      if (saleDate) {
        const idx = bucketIndex(saleDate);
        if (idx >= 0) {
          sale[idx] += device.salePrice ?? 0;
          profit[idx] += device.profit;
          saleCount += 1;
        }
      }
    }
  });

  const purchaseTotal = purchase.reduce((a, b) => a + b, 0);
  const saleTotal = sale.reduce((a, b) => a + b, 0);
  const profitTotal = profit.reduce((a, b) => a + b, 0);
  const { yMax, yStep } = niceYAxis(Math.max(...purchase, ...sale, ...profit, 0));

  return {
    purchaseLabel: meta.purchaseLabel,
    purchaseValue: meta.formatValue(purchaseTotal),
    purchaseCaption: `${purchaseCount} device${purchaseCount === 1 ? '' : 's'}`,
    saleLabel: meta.saleLabel,
    saleValue: meta.formatValue(saleTotal),
    saleCaption: `${saleCount} device${saleCount === 1 ? '' : 's'}`,
    netProfit: meta.formatValue(Math.abs(profitTotal)),
    netProfitLabel: profitLossLabel(profitTotal, 'Net'),
    isNetLoss: profitTotal < 0,
    chartTitle: meta.chartTitle,
    categories,
    yMax,
    yStep,
    purchase,
    sale,
    profit,
  };
}

export default function ReportsScreen() {
  useScreenStatusBar('dark-content', colors.white);
  const { devices } = useShopData();
  const [period, setPeriod] = useState<Period>('Daily');
  const data = useMemo(() => buildPeriodData(period, devices), [period, devices]);

  const series: ChartSeries[] = [
    { name: 'Purchase', color: colors.blue, values: data.purchase },
    { name: 'Sale', color: colors.greenDark, values: data.sale },
    { name: 'Profit', color: colors.primary, values: data.profit },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Reports & Analytics</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.segmentedControl}>
          {PERIODS.map(p => {
            const active = p === period;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setPeriod(p)}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>{data.purchaseLabel}</Text>
              {data.purchaseCaption ? (
                <Text style={[styles.statIcon, { color: colors.blue }]}>↗</Text>
              ) : null}
            </View>
            <Text style={[styles.statValue, { color: colors.blue }]}>
              {data.purchaseValue}
            </Text>
            {data.purchaseCaption ? (
              <Text style={styles.statCaption}>{data.purchaseCaption}</Text>
            ) : null}
          </View>
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>{data.saleLabel}</Text>
              {data.saleCaption ? (
                <Text style={[styles.statIcon, { color: colors.greenDark }]}>$</Text>
              ) : null}
            </View>
            <Text style={[styles.statValue, { color: colors.greenDark }]}>
              {data.saleValue}
            </Text>
            {data.saleCaption ? (
              <Text style={styles.statCaption}>{data.saleCaption}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.netProfitCard}>
          <View style={styles.netProfitHeader}>
            <Text style={styles.statLabel}>{data.netProfitLabel}</Text>
            <Text style={[styles.statIcon, { color: data.isNetLoss ? colors.danger : colors.greenDark }]}>
              {data.isNetLoss ? '↘' : '↗'}
            </Text>
          </View>
          <Text
            style={[styles.netProfitValue, data.isNetLoss ? { color: colors.danger } : null]}>
            {data.netProfit}
          </Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{data.chartTitle}</Text>
          <BarChart
            categories={data.categories}
            series={series}
            yMax={data.yMax}
            yStep={data.yStep}
          />
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
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  statLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textMuted,
  },
  statIcon: {
    flexShrink: 0,
    fontSize: 18,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 10,
  },
  statCaption: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: 4,
  },
  netProfitCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginBottom: 16,
  },
  netProfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  netProfitValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 10,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
});
