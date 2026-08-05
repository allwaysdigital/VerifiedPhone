import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import BackButton from '../components/BackButton';
import { CalendarIcon, CardIcon, GiftIcon, WarningIcon } from '../components/SubscriptionIcons';
import {
  PLANS,
  PLAN_FEATURES,
  formatSubscriptionDate,
  getTrialDaysRemaining,
  TRIAL_DAYS,
} from '../types/domain';
import { useShopData } from '../context/ShopDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSubscription'>;

export default function ManageSubscriptionScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { subscription, cancelSubscription } = useShopData();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const plan = subscription?.planId ? PLANS[subscription.planId] : null;
  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const hasAccess = isTrial || isActive;
  const trialEndsDate = subscription?.trialEndsAt
    ? formatSubscriptionDate(subscription.trialEndsAt)
    : '';
  const daysRemaining = subscription ? getTrialDaysRemaining(subscription) : 0;

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Manage Subscription</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
    } finally {
      setCancelling(false);
      setCancelModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Manage Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {hasAccess && plan ? (
          <>
            <View style={styles.statusCard}>
              <View style={styles.statusHeaderRow}>
                <View style={styles.giftIconWrap}>
                  <GiftIcon size={22} />
                </View>
                <View style={styles.statusHeaderText}>
                  <Text style={styles.statusTitle}>
                    {isTrial ? 'FREE Trial Active' : 'Active Subscription'}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {isTrial ? `Your trial ends on ${trialEndsDate}` : `Renews on ${trialEndsDate}`}
                  </Text>
                </View>
                {isTrial ? (
                  <View style={styles.trialPill}>
                    <Text style={styles.trialPillText}>Trial</Text>
                  </View>
                ) : null}
              </View>

              {isTrial ? (
                <View style={styles.progressWrap}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Days Remaining</Text>
                    <Text style={styles.progressValue}>{daysRemaining} days</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(100, (daysRemaining / TRIAL_DAYS) * 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              ) : null}

              <Text style={styles.autoRenewNote}>
                After trial: Auto-renews at ₹{plan.price.toLocaleString('en-IN')}
                {plan.id === 'yearly' ? '/year' : '/month'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.planTopRow}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.planPriceWrap}>
                  <Text style={styles.planPrice}>₹{plan.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.planPriceSuffix}>{plan.billingSuffix}</Text>
                </View>
              </View>
              <Text style={styles.planSubLabel}>Monthly subscription</Text>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <CalendarIcon size={18} color={colors.textFaint} />
                <View>
                  <Text style={styles.infoLabel}>First Billing Date</Text>
                  <Text style={styles.infoValue}>{trialEndsDate}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <CardIcon size={18} color={colors.textFaint} />
                <View>
                  <Text style={styles.infoLabel}>Payment Method</Text>
                  <Text style={styles.infoValue}>{subscription.paymentMethod}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Plan Includes</Text>
              {PLAN_FEATURES.map(feature => (
                <View key={feature} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cancelCard}>
              <View style={styles.cancelHeaderRow}>
                <WarningIcon size={20} color={colors.danger} />
                <Text style={styles.cancelTitle}>{isTrial ? 'Cancel Trial' : 'Cancel Subscription'}</Text>
              </View>
              <Text style={styles.cancelDescription}>
                {isTrial
                  ? `You can cancel your trial anytime. No charges will be applied if cancelled before ${trialEndsDate}.`
                  : `You can cancel anytime. You'll keep access until ${trialEndsDate}.`}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCancelModalVisible(true)}>
                <Text style={styles.cancelButtonText}>
                  {isTrial ? 'Cancel Trial' : 'Cancel Subscription'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.expiredIconWrap}>
              <WarningIcon size={40} />
            </View>
            <Text style={styles.expiredTitle}>
              {subscription.status === 'expired' ? 'Subscription Expired' : 'No Active Subscription'}
            </Text>
            <Text style={styles.expiredDescription}>
              {subscription.status === 'expired'
                ? 'Your subscription has expired. Renew now to continue using all VerifiedPhone features.'
                : 'Choose a plan to unlock verification, invoicing, and reporting features.'}
            </Text>

            {subscription.status === 'expired' && plan ? (
              <View style={styles.lastPlanCard}>
                <View style={styles.infoRow}>
                  <CalendarIcon size={18} color={colors.textFaint} />
                  <View>
                    <Text style={styles.infoLabel}>Last Active Plan</Text>
                    <Text style={styles.infoValue}>{plan.name}</Text>
                  </View>
                </View>
                <Text style={[styles.infoLabel, styles.expiredOnLabel]}>Expired on</Text>
                <Text style={styles.expiredOnValue}>{subscription.expiredOn}</Text>
              </View>
            ) : null}

            <View style={styles.missingCard}>
              <Text style={styles.missingTitle}>What You're Missing</Text>
              {PLAN_FEATURES.map(feature => (
                <View key={feature} style={styles.featureRow}>
                  <Text style={styles.missingCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.renewButton}
              onPress={() => navigation.navigate('SubscriptionPlans')}>
              <Text style={styles.renewButtonText}>Renew Now</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isTrial ? 'Cancel Trial?' : 'Cancel Subscription?'}
            </Text>
            <Text style={styles.modalBody}>
              Are you sure you want to cancel your {isTrial ? 'trial' : 'subscription'}?
            </Text>
            <Text style={styles.modalNote}>
              You'll lose access to all premium features after {trialEndsDate}.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalNoButton}
                onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.modalNoButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={handleConfirmCancel}
                disabled={cancelling}>
                <Text style={styles.modalYesButtonText}>
                  {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 16,
    padding: 16,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  giftIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeaderText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  trialPill: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trialPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  progressWrap: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.greenDark,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  autoRenewNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  planPriceWrap: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  planPriceSuffix: {
    fontSize: 12,
    color: colors.textFaint,
  },
  planSubLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textFaint,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
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
  cancelCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 16,
    padding: 16,
  },
  cancelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cancelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cancelDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 14,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: 22,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  expiredIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fde8e8',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  expiredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  expiredDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  lastPlanCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 16,
    padding: 16,
  },
  expiredOnLabel: {
    marginTop: 4,
  },
  expiredOnValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  missingCard: {
    backgroundColor: '#fdf6d8',
    borderWidth: 1,
    borderColor: '#f5d76e',
    borderRadius: 16,
    padding: 16,
  },
  missingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  missingCheck: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  renewButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  modalNote: {
    fontSize: 13,
    color: colors.textFaint,
    lineHeight: 19,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalNoButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  modalYesButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalYesButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
