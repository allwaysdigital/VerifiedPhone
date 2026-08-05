import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BackButton from '../components/BackButton';
import { CrownIcon, StarIcon } from '../components/SubscriptionIcons';
import { PLANS, PLAN_FEATURES, type PlanDefinition } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionPlans'>;

function PlanCard({
  plan,
  onSelect,
}: {
  plan: PlanDefinition;
  onSelect: () => void;
}) {
  const isYearly = plan.id === 'yearly';
  return (
    <View style={styles.card}>
      {plan.badge ? (
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>{plan.badge}</Text>
        </View>
      ) : null}

      <View style={styles.cardTopRow}>
        <View style={styles.planIconWrap}>
          {isYearly ? <CrownIcon size={26} /> : <StarIcon size={26} />}
        </View>
        <View style={styles.planTitleWrap}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.cardDescription}</Text>
        </View>
        <View style={styles.priceWrap}>
          <Text style={styles.priceValue}>₹{plan.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.priceSuffix}>{plan.billingSuffix}</Text>
        </View>
      </View>

      <View style={styles.freeBanner}>
        <Text style={styles.freeBannerText}>
          🎉{' '}
          {isYearly
            ? `First month FREE! Pay only ₹${plan.price.toLocaleString('en-IN')} for remaining 11 months`
            : 'First month FREE! Charges start from 2nd month'}
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.featuresTitle}>Features included:</Text>
      {PLAN_FEATURES.map(feature => (
        <View key={feature} style={styles.featureRow}>
          <Text style={styles.featureCheck}>✓</Text>
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.ctaButton} onPress={onSelect}>
        <Text style={styles.ctaButtonText}>Get {plan.name}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SubscriptionPlansScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <View style={styles.trialPill}>
            <Text style={styles.trialPillText}>Free Trial</Text>
          </View>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>Unlock premium features and boost your productivity</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PlanCard
          plan={PLANS.monthly}
          onSelect={() => navigation.navigate('PlanDetail', { planId: 'monthly' })}
        />
        <PlanCard
          plan={PLANS.yearly}
          onSelect={() => navigation.navigate('PlanDetail', { planId: 'yearly' })}
        />
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
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  trialPill: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trialPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.pink,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  planIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleWrap: {
    flex: 1,
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  planDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  priceSuffix: {
    fontSize: 12,
    color: colors.textFaint,
  },
  freeBanner: {
    backgroundColor: '#fef3d5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  freeBannerText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginBottom: 14,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureCheck: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
