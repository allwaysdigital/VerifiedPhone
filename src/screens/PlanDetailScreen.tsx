import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BackButton from '../components/BackButton';
import { PLANS, PLAN_FEATURES, TRIAL_DAYS, startTrial } from '../data/subscription';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetail'>;

function formatFirstBillingDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL_DAYS);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const SUBSCRIPTION_TERMS = [
  '1 Month FREE trial - No payment required now',
  'Payment info saved for auto-renewal after trial',
];

export default function PlanDetailScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const plan = PLANS[route.params.planId];
  const firstBillingDate = formatFirstBillingDate();
  const terms = [
    ...SUBSCRIPTION_TERMS,
    `Auto-renews ${plan.id === 'yearly' ? 'yearly' : 'monthly'} after trial ends`,
    'Cancel anytime during trial - No charges',
    'No hidden charges or setup fees',
  ];

  const handleSubscribe = () => {
    startTrial(plan.id);
    navigation.navigate('TrialActivated', { planId: plan.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{plan.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.priceCard}>
          <View style={styles.freePill}>
            <Text style={styles.freePillText}>🎉 1 Month FREE</Text>
          </View>
          <Text style={styles.tagline}>Perfect for {plan.tagline}</Text>
          <Text style={styles.priceValue}>₹{plan.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.priceSuffix}>{plan.billingSuffix}</Text>
          <View style={styles.priceDivider} />
          <Text style={styles.billingNote}>First billing on {firstBillingDate}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features included:</Text>
          {PLAN_FEATURES.map(feature => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.featureCheckWrap}>
                <Text style={styles.featureCheck}>✓</Text>
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Subscription Terms</Text>
          {terms.map(term => (
            <Text key={term} style={styles.termItem}>
              • {term}
            </Text>
          ))}
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
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
    fontFamily: fonts.robotoSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  priceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  freePill: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  freePillText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  priceSuffix: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  priceDivider: {
    height: 1,
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 14,
  },
  billingNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureCheckWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fef3d5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheck: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  termsCard: {
    backgroundColor: '#fef3d5',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  termItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 19,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
