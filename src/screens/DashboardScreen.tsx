import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { formatLakhs } from '../utils/format';
import EmptyState from '../components/EmptyState';
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
  onPress?: () => void;
};

function QuickAction({ label, iconBg, icon, round, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
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

function todayLabel(): string {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function DashboardScreen({ navigation }: Props) {
  useScreenStatusBar('light-content', colors.primary);
  const insets = useSafeAreaInsets();
  const { devices } = useShopData();

  const today = todayLabel();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const stats = useMemo(() => {
    const availableCount = devices.filter(d => d.status === 'Available').length;
    const purchasedToday = devices.filter(d => d.purchaseDate === today);
    const soldToday = devices.filter(d => d.status === 'Sold' && d.saleDate === today);
    const todayPurchaseTotal = purchasedToday.reduce((sum, d) => sum + d.purchasePrice, 0);
    const todaySaleTotal = soldToday.reduce((sum, d) => sum + (d.salePrice ?? 0), 0);
    const todayProfitTotal = soldToday.reduce((sum, d) => sum + d.profit, 0);
    return {
      availableCount,
      purchasedTodayCount: purchasedToday.length,
      soldTodayCount: soldToday.length,
      todayPurchaseTotal,
      todaySaleTotal,
      todayProfitTotal,
    };
  }, [devices, today]);

  const brandDistribution = useMemo<BrandRow[]>(() => {
    const byBrand = new Map<string, { units: number; value: number }>();
    devices.forEach(device => {
      const entry = byBrand.get(device.brand) ?? { units: 0, value: 0 };
      entry.units += 1;
      entry.value += device.purchasePrice;
      byBrand.set(device.brand, entry);
    });
    return Array.from(byBrand.entries())
      .map(([brand, { units, value }]) => ({
        brand,
        units: `${units} unit${units === 1 ? '' : 's'}`,
        value: formatLakhs(value),
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [devices]);

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
          <Text style={styles.headerDate}>{currentDate}</Text>
        </View>

        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Stock"
            value={String(stats.availableCount)}
            caption="Brand & Model :"
            valueColor={colors.primary}
            iconBg={colors.primary}
            icon={<StockBoxIcon width={32} height={32} />}
          />
          <StatCard
            label="Today Purchase"
            value={`₹${stats.todayPurchaseTotal.toLocaleString('en-IN')}`}
            caption={`${stats.purchasedTodayCount} devices`}
            valueColor={colors.purple}
            iconBg={colors.purple}
            icon={<PurchaseCartIcon width={32} height={32} />}
          />
          <StatCard
            label="Today Sale"
            value={`₹${stats.todaySaleTotal.toLocaleString('en-IN')}`}
            caption={`${stats.soldTodayCount} devices`}
            valueColor={colors.green}
            iconBg={colors.green}
            icon={<SaleDollarIcon width={32} height={32} />}
          />
          <StatCard
            label="Today Profit"
            value={`₹${stats.todayProfitTotal.toLocaleString('en-IN')}`}
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
            onPress={() => navigation.navigate('Brands')}
          />
          <QuickAction
            label="Add Sale"
            iconBg={colors.greenDark}
            icon={<AddSaleDollarIcon width={24} height={24} />}
            round
            onPress={() => navigation.navigate('AddSale')}
          />
        </View>

        <Text style={styles.sectionTitle}>Brand-wise Distribution</Text>
        {brandDistribution.length === 0 ? (
          <EmptyState message="No stock yet" />
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Brands')}>
            <View style={styles.brandCard}>
              {brandDistribution.map(row => (
                <View key={row.brand} style={styles.brandRow}>
                  <Text style={styles.brandName}>{row.brand}</Text>
                  <Text style={styles.brandUnits}>{row.units}</Text>
                  <Text style={styles.brandValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
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
