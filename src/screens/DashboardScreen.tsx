import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import HeaderLogo from '../assets/icons/header_logo.svg';
import StockBoxIcon from '../assets/icons/stock_box.svg';
import PurchaseCartIcon from '../assets/icons/purchase_cart.svg';
import SaleDollarIcon from '../assets/icons/sale_dollar.svg';
import ProfitChartIcon from '../assets/icons/profit_chart.svg';
import AddBrandPersonIcon from '../assets/icons/add_brand_person.svg';
import AddSaleDollarIcon from '../assets/icons/add_sale_dollar.svg';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  valueColor: string;
  iconBg: string;
  icon: React.ReactNode;
};

function StatCard({ label, value, caption, valueColor, iconBg, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      {caption ? <Text style={styles.statCaption}>{caption}</Text> : null}
    </View>
  );
}

type QuickActionProps = {
  label: string;
  iconBg: string;
  icon: React.ReactNode;
  round?: boolean;
};

function QuickAction({ label, iconBg, icon, round }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickActionCard}>
      <View
        style={[
          styles.quickActionIconWrap,
          { backgroundColor: iconBg },
          round && styles.quickActionIconRound,
        ]}>
        {icon}
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

type BrandRow = { brand: string; units: string; value: string };

const brandDistribution: BrandRow[] = [
  { brand: 'Apple', units: '15 units', value: '₹8.5L' },
  { brand: 'Samsung', units: '22 units', value: '₹9.5L' },
  { brand: 'OnePlus', units: '18 units', value: '₹5.5L' },
  { brand: 'Xiaomi', units: '25 units', value: '₹7.5L' },
  { brand: 'Others', units: '12 units', value: '₹3.5L' },
];

export default function DashboardScreen(_props: Props) {
  useScreenStatusBar('light-content', colors.primary);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerLogoRow}>
            <HeaderLogo width={32} height={32} />
            <View>
              <Text style={styles.headerTitle}>Mobile Hub</Text>
              <Text style={styles.headerWordmark}>
                VERIFIED <Text style={styles.headerWordmarkBold}>PHONE</Text> — DEALER SATHI
              </Text>
            </View>
          </View>
          <Text style={styles.headerDate}>Tuesday, Feb 25, 2026</Text>
        </View>

        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Stock"
            value="4"
            caption="Brand & Model :"
            valueColor={colors.primary}
            iconBg={colors.primary}
            icon={<StockBoxIcon width={32} height={32} />}
          />
          <StatCard
            label="Today Purchase"
            value="₹0"
            caption="0 devices"
            valueColor={colors.purple}
            iconBg={colors.purple}
            icon={<PurchaseCartIcon width={32} height={32} />}
          />
          <StatCard
            label="Today Sale"
            value="₹41,500"
            caption="1 devices"
            valueColor={colors.green}
            iconBg={colors.green}
            icon={<SaleDollarIcon width={32} height={32} />}
          />
          <StatCard
            label="Today Profit"
            value="₹3,500"
            valueColor={colors.greenDark}
            iconBg={colors.greenDark}
            icon={<ProfitChartIcon width={32} height={32} />}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <QuickAction
            label="Add Brand"
            iconBg={colors.pink}
            icon={<AddBrandPersonIcon width={24} height={24} />}
            round
          />
          <QuickAction
            label="Add Sale"
            iconBg={colors.greenDark}
            icon={<AddSaleDollarIcon width={24} height={24} />}
            round
          />
        </View>

        <Text style={styles.sectionTitle}>Brand-wise Distribution</Text>
        <View style={styles.brandCard}>
          {brandDistribution.map(row => (
            <View key={row.brand} style={styles.brandRow}>
              <Text style={styles.brandName}>{row.brand}</Text>
              <Text style={styles.brandUnits}>{row.units}</Text>
              <Text style={styles.brandValue}>{row.value}</Text>
            </View>
          ))}
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
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: fonts.interMedium,
    fontSize: 20,
    color: colors.white,
  },
  headerWordmark: {
    fontFamily: fonts.robotoRegular,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 1,
    marginTop: 2,
  },
  headerWordmarkBold: {
    fontFamily: fonts.robotoBold,
  },
  headerDate: {
    fontFamily: fonts.robotoMedium,
    fontSize: 14,
    color: colors.white,
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: fonts.robotoMedium,
    fontSize: 16,
    color: colors.textMuted,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
    elevation: 2,
  },
  statIconWrap: {
    width: 51,
    height: 51,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontFamily: fonts.sfProRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  statValue: {
    fontFamily: fonts.sfProSemiBold,
    fontSize: 20,
    marginTop: 8,
  },
  statCaption: {
    fontFamily: fonts.sfProRegular,
    fontSize: 15,
    color: '#999999',
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
    elevation: 2,
  },
  quickActionIconWrap: {
    width: 51,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionIconRound: {
    borderRadius: 100,
  },
  quickActionLabel: {
    fontFamily: fonts.sfProRegular,
    fontSize: 12,
    color: colors.text,
  },
  brandCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 12,
    gap: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
    elevation: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
  },
  brandName: {
    fontFamily: fonts.robotoRegular,
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  brandUnits: {
    fontFamily: fonts.robotoRegular,
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  brandValue: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 16,
    color: colors.greenDark,
  },
});
