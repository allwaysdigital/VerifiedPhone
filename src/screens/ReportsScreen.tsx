import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BarChart, { ChartSeries } from '../components/BarChart';

type Period = 'Daily' | 'Monthly' | 'Yearly';
const PERIODS: Period[] = ['Daily', 'Monthly', 'Yearly'];

type PeriodData = {
  purchaseLabel: string;
  purchaseValue: string;
  purchaseCaption?: string;
  saleLabel: string;
  saleValue: string;
  saleCaption?: string;
  netProfit: string;
  chartTitle: string;
  categories: string[];
  yMax: number;
  yStep: number;
  purchase: number[];
  sale: number[];
  profit: number[];
};

const DATA: Record<Period, PeriodData> = {
  Daily: {
    purchaseLabel: 'Total Purchase',
    purchaseValue: '₹0',
    purchaseCaption: '0 devices',
    saleLabel: 'Total Sale',
    saleValue: '₹41,500',
    saleCaption: '1 devices',
    netProfit: '₹3,500',
    chartTitle: 'Last 7 Days Trend',
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    yMax: 80000,
    yStep: 20000,
    purchase: [51000, 44000, 39000, 44000, 55000, 60000, 44000],
    sale: [59000, 75000, 34000, 72000, 64000, 54000, 69000],
    profit: [25000, 20000, 56000, 36000, 20000, 13000, 32000],
  },
  Monthly: {
    purchaseLabel: 'This Month Purchase',
    purchaseValue: '₹5.8L',
    saleLabel: 'This Month Sale',
    saleValue: '₹6.5L',
    netProfit: '₹3,500',
    chartTitle: 'Last 6 Months Trend',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    yMax: 800000,
    yStep: 200000,
    purchase: [510000, 400000, 440000, 390000, 440000, 610000],
    sale: [590000, 340000, 750000, 340000, 690000, 540000],
    profit: [250000, 560000, 190000, 560000, 320000, 130000],
  },
  Yearly: {
    purchaseLabel: 'This Year Purchase',
    purchaseValue: '₹5.8L',
    saleLabel: 'This Year Sale',
    saleValue: '₹6.5L',
    netProfit: '₹3,500',
    chartTitle: 'Last 5 Years Trend',
    categories: ['2020', '2021', '2022', '2023', '2024'],
    yMax: 800000,
    yStep: 200000,
    purchase: [510000, 440000, 440000, 390000, 610000],
    sale: [590000, 690000, 750000, 340000, 540000],
    profit: [250000, 320000, 190000, 560000, 130000],
  },
};

export default function ReportsScreen() {
  useScreenStatusBar('dark-content', colors.white);
  const [period, setPeriod] = useState<Period>('Daily');
  const data = DATA[period];

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
            <Text style={styles.statLabel}>Net Profit</Text>
            <Text style={[styles.statIcon, { color: colors.greenDark }]}>↗</Text>
          </View>
          <Text style={styles.netProfitValue}>{data.netProfit}</Text>
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
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 15,
    color: colors.textMuted,
  },
  statIcon: {
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
    alignItems: 'center',
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
