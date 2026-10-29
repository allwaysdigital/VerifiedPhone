import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { PLANS, type PlanId } from '../types/domain';
import SubscriptionHeader from '../components/SubscriptionHeader';
import { AlertTriangleIcon, CheckCircleIcon, ShieldCheckIcon, UpiIcon } from '../components/SubscriptionIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionPlans'>;

// Real entry-counting/gating isn't wired up yet (tracked separately, before
// Razorpay integration) — this screen is built to support both states
// against a mock count so the real data can drop in later with no layout
// changes. FREE_ENTRY_LIMIT matches the Figma spec's "10 free entries".
const FREE_ENTRY_LIMIT = 10;
const MOCK_ENTRIES_USED = 4;

export default function SubscriptionPlansScreen({ navigation }: Props) {
  useScreenStatusBar('light-content', colors.headerGradientStart);
  const { shop } = useShopData();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');

  const entriesUsed = MOCK_ENTRIES_USED;
  const limitReached = entriesUsed >= FREE_ENTRY_LIMIT;
  const entriesLeft = Math.max(0, FREE_ENTRY_LIMIT - entriesUsed);

  const yearly = PLANS.yearly;
  const monthly = PLANS.monthly;
  const yearlyMonthlyEquivalent = Math.round(yearly.price / 12);
  const yearlySavings = monthly.price * 12 - yearly.price;

  const handleSubscribe = () => {
    navigation.navigate('PaymentStatus', { status: 'activating', planId: selectedPlan });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SubscriptionHeader
        variant="tall"
        title={shop?.shopName || 'My Shop'}
        subtitle={
          <>
            VERIFIED <Text style={styles.wordmarkBold}>PHONE</Text> — DEALER SATHI
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.banner, limitReached ? styles.bannerLimit : styles.bannerTrial]}>
          <View style={styles.bannerTopRow}>
            <View style={styles.bannerTitleRow}>
              <View style={styles.bannerIconWrap}>
                <AlertTriangleIcon size={14} />
              </View>
              <Text style={styles.bannerTitle}>
                {limitReached ? 'Free limit reached' : 'Free trial in progress'}
              </Text>
            </View>
            {limitReached ? (
              <View style={styles.bannerCountPill}>
                <Text style={styles.bannerCountPillText}>
                  {entriesUsed} / {FREE_ENTRY_LIMIT} used
                </Text>
              </View>
            ) : (
              <View style={styles.bannerTrialRight}>
                <Text style={styles.bannerLeftText}>{entriesLeft} left</Text>
                <View style={styles.bannerCountPill}>
                  <Text style={styles.bannerCountPillText}>
                    {entriesUsed} / {FREE_ENTRY_LIMIT} used
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (entriesUsed / FREE_ENTRY_LIMIT) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.bannerBody}>
            {limitReached
              ? 'Your draft is saved. Subscribe to unlock unlimited entries and continue.'
              : `You have ${entriesLeft} free purchase entries remaining. Subscribe now to unlock unlimited entries anytime.`}
          </Text>
        </View>

        <View style={styles.headlineWrap}>
          <Text style={styles.headline}>Keep every phone record verified</Text>
          <View style={styles.benefitRow}>
            <View style={styles.benefitIconWrap}>
              <CheckCircleIcon size={14} />
            </View>
            <Text style={styles.benefitText}>Unlimited purchase entries</Text>
          </View>
        </View>

        <View style={styles.plansWrap}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}>
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueBadgeText}>BEST VALUE</Text>
            </View>
            <View style={styles.planRow}>
              <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioSelected]}>
                {selectedPlan === 'yearly' ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Yearly</Text>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPrice}>₹{yearly.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.planPriceSuffix}>/year incl. GST</Text>
                </View>
                <View style={styles.planMetaRow}>
                  <Text style={styles.planMetaGreen}>₹{yearlyMonthlyEquivalent}/month</Text>
                  <Text style={styles.planMetaDot}>•</Text>
                  <View style={styles.saveChip}>
                    <Text style={styles.saveChipText}>Save ₹{yearlySavings.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}>
            <View style={styles.planRow}>
              <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioSelected]}>
                {selectedPlan === 'monthly' ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Monthly</Text>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPrice}>₹{monthly.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.planPriceSuffix}>/month incl. GST</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footNotePill}>
          <ShieldCheckIcon size={14} color={colors.textMuted} />
          <Text style={styles.footNoteText}>Saved records & PDFs always stay available</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe} activeOpacity={0.85}>
          <UpiIcon size={18} />
          <Text style={styles.subscribeButtonText}>Subscribe with UPI AutoPay</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          Auto-renews. Cancel anytime. No refunds for the current period.
        </Text>
        <View style={styles.legalRow}>
          <Text style={styles.legalLink}>Terms</Text>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legalLink}>Privacy Policy</Text>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ManageSubscription')}>
            <Text style={styles.legalLinkAccent}>Already paid? Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  wordmarkBold: {
    fontFamily: fonts.robotoBold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  banner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  bannerTrial: {
    backgroundColor: '#fffbeb',
    borderColor: 'rgba(253,230,138,0.8)',
  },
  bannerLimit: {
    backgroundColor: '#fffbeb',
    borderColor: 'rgba(253,230,138,0.8)',
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerIconWrap: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 9999,
    padding: 4,
  },
  bannerTitle: {
    fontFamily: fonts.robotoBold,
    fontSize: 12,
    color: '#78350f',
  },
  bannerTrialRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerLeftText: {
    fontFamily: fonts.robotoMedium,
    fontSize: 11,
    color: '#92400e',
  },
  bannerCountPill: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bannerCountPillText: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: '#b45309',
  },
  progressTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(253,230,138,0.8)',
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#d97706',
  },
  bannerBody: {
    fontFamily: fonts.robotoMedium,
    fontSize: 12,
    color: 'rgba(120,53,15,0.9)',
    marginTop: 10,
    lineHeight: 16.5,
  },
  headlineWrap: {
    gap: 8,
  },
  headline: {
    fontFamily: fonts.robotoBold,
    fontSize: 24,
    color: '#0f172a',
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitIconWrap: {
    backgroundColor: '#d1fae5',
    borderRadius: 9999,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 14,
    color: '#334155',
  },
  plansWrap: {
    gap: 14,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 17,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#f59e0b',
    padding: 16,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: '#d97706',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  bestValueBadgeText: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.55,
  },
  planRow: {
    flexDirection: 'row',
    gap: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  planInfo: {
    flex: 1,
    gap: 2,
  },
  planName: {
    fontFamily: fonts.robotoBold,
    fontSize: 16,
    color: '#0f172a',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  planPrice: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: '#0f172a',
  },
  planPriceSuffix: {
    fontFamily: fonts.robotoMedium,
    fontSize: 12,
    color: '#64748b',
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  planMetaGreen: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 12,
    color: '#059669',
  },
  planMetaDot: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  saveChip: {
    backgroundColor: '#ecfdf5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveChipText: {
    fontFamily: fonts.robotoBold,
    fontSize: 12,
    color: '#047857',
  },
  footNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footNoteText: {
    fontFamily: fonts.robotoMedium,
    fontSize: 11,
    color: '#475569',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#d97706',
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
  },
  subscribeButtonText: {
    fontFamily: fonts.robotoBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.4,
  },
  disclaimer: {
    fontFamily: fonts.robotoMedium,
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  legalLink: {
    fontFamily: fonts.robotoMedium,
    fontSize: 12,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  legalLinkAccent: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 12,
    color: '#d97706',
    textDecorationLine: 'underline',
  },
});
