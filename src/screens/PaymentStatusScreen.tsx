import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { PLANS } from '../types/domain';
import SubscriptionHeader from '../components/SubscriptionHeader';
import {
  ClockIcon,
  CopyIcon,
  SupportHeadsetIcon,
  UpiIcon,
  XCircleIcon,
} from '../components/SubscriptionIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentStatus'>;

function mockTxnId(prefix: string): string {
  return `${prefix}-${Math.floor(100000000 + Math.random() * 899999999)}`;
}

function SuccessContent({ navigation, route }: Props) {
  const { planId } = route.params;
  const plan = PLANS[planId];
  const renewLabel =
    planId === 'yearly'
      ? new Date(Date.now() + 365 * 86400000).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  const [txnId] = useState(() => mockTxnId('MH-TXN'));

  return (
    <View style={styles.centeredBody}>
      <View style={styles.celebrationBadge}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <View style={styles.checkmarkPill}>
          <Text style={styles.checkmarkPillText}>✓</Text>
        </View>
      </View>
      <Text style={styles.successTitle}>You're subscribed 🎉</Text>
      <View style={styles.successPill}>
        <Text style={styles.successPillText}>
          {plan.name} · Renews on {renewLabel}
        </Text>
      </View>
      <Text style={styles.successBody}>
        Unlimited stock purchases, verification checks, and instant WhatsApp customer sharing are
        now activated for your dealership.
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan Type</Text>
          <Text style={styles.summaryValueBold}>Dealer Pro {planId === 'yearly' ? 'Annual' : 'Monthly'}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Paid</Text>
          <Text style={styles.summaryValueBold}>
            ₹{plan.price.toLocaleString('en-IN')} <Text style={styles.summaryValueMuted}>(inclusive GST)</Text>
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Transaction ID</Text>
          <Text style={styles.summaryValueMono}>{txnId}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('ManageSubscription')}
        activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Continue</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </TouchableOpacity>
      <Text style={styles.returnsCaption}>Returns automatically to purchase form</Text>
    </View>
  );
}

function ActivatingContent({ navigation, route }: Props) {
  const { planId } = route.params;
  const plan = PLANS[planId];
  const [txnId] = useState(() => mockTxnId('DLR'));

  return (
    <View style={styles.centeredBody}>
      <View style={styles.activatingRing}>
        <ClockIcon size={34} color="#f59e0b" />
      </View>
      <Text style={styles.activatingTitle}>Activating your plan…</Text>
      <Text style={styles.activatingBody}>
        Syncing subscription tokens with National Dealer Registry and Bank UPI Gateway.
      </Text>

      <View style={styles.delayCard}>
        <View style={styles.delayIconWrap}>
          <ClockIcon size={16} color={colors.white} />
        </View>
        <View style={styles.delayTextWrap}>
          <View style={styles.delayHeaderRow}>
            <Text style={styles.delayLabel}>DELAY NOTICE</Text>
            <View style={styles.delayDot} />
            <Text style={styles.delaySubLabel}>Gateway Check</Text>
          </View>
          <Text style={styles.delayBody}>
            Taking longer than usual. Your payment is being confirmed.
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeaderRow}>
          <Text style={styles.summaryCardTitle}>Payment Summary</Text>
          <View style={styles.pendingPill}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingPillText}>Pending</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Selected Plan</Text>
          <Text style={styles.summaryValueBold}>Dealer Pro {planId === 'yearly' ? 'Annual' : 'Monthly'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Billing Amount</Text>
          <Text style={styles.summaryValueBold}>
            ₹{plan.price.toLocaleString('en-IN')} / {planId === 'yearly' ? 'year' : 'month'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValueBold}>UPI AutoPay</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Network Status</Text>
          <Text style={styles.summaryValueAmber}>Confirming with bank</Text>
        </View>
        <View style={styles.txnRow}>
          <Text style={styles.txnText}>TXN: {txnId}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Copy</Text>
            <CopyIcon size={11} color="#855300" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.setParams({ status: 'success' })}
        activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Refresh Status</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('MainTabs')}
        activeOpacity={0.85}>
        <Text style={styles.secondaryButtonText}>Go to Home</Text>
      </TouchableOpacity>

      <Text style={styles.secureFooter}>🔒 100% Secure Transaction via Dealer Sathi UPI</Text>
      <View style={styles.helpLinksRow}>
        <Text style={styles.helpLink}>Need Help?</Text>
        <Text style={styles.legalDot}>•</Text>
        <Text style={styles.helpLinkMuted}>Retry Policies</Text>
      </View>
    </View>
  );
}

function FailedContent({ navigation, route }: Props) {
  const { planId } = route.params;
  const plan = PLANS[planId];
  const [txnId] = useState(() => mockTxnId('MH-TXN'));

  return (
    <View style={styles.centeredBody}>
      <View style={styles.failedIconOuter}>
        <View style={styles.failedIconInner}>
          <XCircleIcon size={26} color={colors.white} />
        </View>
      </View>
      <Text style={styles.failedTitle}>Payment didn't go through</Text>
      <Text style={styles.failedSubtitle}>Transaction was declined by your bank</Text>

      <View style={styles.infoCallout}>
        <SupportHeadsetIcon size={16} color="#4338ca" />
        <Text style={styles.infoCalloutText}>
          If money was deducted, it will either activate your plan within a few minutes or be
          refunded by your bank, usually within <Text style={styles.boldInline}>5–7 working days</Text>.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeaderRow}>
          <Text style={styles.summaryCardTitle}>PAYMENT DETAILS</Text>
          <View style={styles.unsuccessfulPill}>
            <View style={styles.unsuccessfulDot} />
            <Text style={styles.unsuccessfulPillText}>Unsuccessful</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Attempted Plan</Text>
            <Text style={styles.attemptedPlanValue}>Dealer Pro {planId === 'yearly' ? 'Annual' : 'Monthly'}</Text>
          </View>
          <Text style={styles.attemptedPlanPrice}>₹{plan.price.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Failure Reason</Text>
          <Text style={styles.failureReasonText}>Bank transaction timeout or payment declined</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.txnRefRow}>
          <View>
            <Text style={styles.summaryLabel}>Transaction Ref</Text>
            <Text style={styles.summaryValueMono}>{txnId}-F</Text>
          </View>
          <TouchableOpacity style={styles.copyIconButton}>
            <CopyIcon size={14} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.setParams({ status: 'activating' })}
        activeOpacity={0.85}>
        <UpiIcon size={14} color="#613b00" />
        <Text style={[styles.primaryButtonText, styles.primaryButtonTextDark]}>Try Again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}>
        <Text style={styles.secondaryButtonText}>Close</Text>
      </TouchableOpacity>

      <Text style={styles.helpLink}>Need help? Contact Support</Text>
      <Text style={styles.secureFooter}>🔒 100% Secure Transaction via Dealer Sathi UPI</Text>
    </View>
  );
}

export default function PaymentStatusScreen(props: Props) {
  const { navigation, route } = props;
  const { status, planId } = route.params;
  useScreenStatusBar('light-content', colors.headerGradientStart);

  const isSuccess = status === 'success';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isSuccess ? (
        <SubscriptionHeader
          variant="tall"
          title="Mobile Hub"
          subtitle={
            <>
              VERIFIED <Text style={styles.wordmarkBold}>PHONE</Text> — DEALER SATHI
            </>
          }
        />
      ) : (
        <SubscriptionHeader variant="short" title="Payment Checkout" onBack={() => navigation.goBack()} />
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {status === 'success' ? <SuccessContent {...props} /> : null}
        {status === 'activating' ? <ActivatingContent {...props} /> : null}
        {status === 'failed' ? <FailedContent {...props} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  wordmarkBold: {
    fontFamily: fonts.robotoBold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  centeredBody: {
    alignItems: 'center',
  },
  // Success
  celebrationBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    borderWidth: 4,
    borderColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationEmoji: {
    fontSize: 30,
  },
  checkmarkPill: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkPillText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.robotoBold,
  },
  successTitle: {
    fontFamily: fonts.robotoBold,
    fontSize: 24,
    color: '#0f172a',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  successPill: {
    backgroundColor: 'rgba(236,253,245,0.8)',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 5,
    marginTop: 12,
  },
  successPillText: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: '#059669',
  },
  successBody: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 19.5,
    marginTop: 14,
    maxWidth: 300,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(241,245,249,0.9)',
    padding: 15,
    width: '100%',
    marginTop: 24,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(226,232,240,0.6)',
  },
  summaryLabel: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#64748b',
  },
  summaryValueBold: {
    fontFamily: fonts.robotoBold,
    fontSize: 12,
    color: '#1e293b',
  },
  summaryValueMuted: {
    fontFamily: fonts.robotoRegular,
    fontSize: 10,
    color: '#64748b',
  },
  summaryValueMono: {
    fontFamily: fonts.robotoRegular,
    fontSize: 11,
    color: '#475569',
  },
  summaryValueAmber: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: '#855300',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 24,
  },
  primaryButtonText: {
    fontFamily: fonts.robotoBold,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  primaryButtonTextDark: {
    fontSize: 13,
    color: '#613b00',
  },
  primaryButtonArrow: {
    color: colors.white,
    fontSize: 16,
  },
  returnsCaption: {
    fontFamily: fonts.robotoRegular,
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 10,
  },
  // Activating
  activatingRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,221,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  activatingTitle: {
    fontFamily: fonts.interBold,
    fontSize: 22,
    color: '#131b2e',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  activatingBody: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: '#534434',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
    lineHeight: 18,
  },
  delayCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,221,184,0.4)',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginTop: 20,
  },
  delayIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delayTextWrap: {
    flex: 1,
  },
  delayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  delayLabel: {
    fontFamily: fonts.interSemiBold,
    fontSize: 11,
    color: '#2a1700',
    letterSpacing: 0.55,
  },
  delayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#855300',
  },
  delaySubLabel: {
    fontFamily: fonts.interMedium,
    fontSize: 10,
    color: '#653e00',
  },
  delayBody: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: '#613b00',
    marginTop: 4,
    lineHeight: 17.9,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  summaryCardTitle: {
    fontFamily: fonts.interSemiBold,
    fontSize: 15,
    color: '#131b2e',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffddb8',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#855300',
  },
  pendingPillText: {
    fontFamily: fonts.interSemiBold,
    fontSize: 11,
    color: '#653e00',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f3ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 8,
  },
  txnText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 10,
    color: '#534434',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyButtonText: {
    fontFamily: fonts.interSemiBold,
    fontSize: 10,
    color: '#855300',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e7ff',
    width: '100%',
    borderRadius: 9999,
    paddingVertical: 14,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontFamily: fonts.interSemiBold,
    fontSize: 13,
    color: '#131b2e',
  },
  secureFooter: {
    fontFamily: fonts.interMedium,
    fontSize: 10,
    color: 'rgba(83,68,52,0.7)',
    marginTop: 18,
  },
  helpLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  helpLink: {
    fontFamily: fonts.interMedium,
    fontSize: 11,
    color: '#0053db',
    marginTop: 14,
  },
  helpLinkMuted: {
    fontFamily: fonts.interMedium,
    fontSize: 10,
    color: '#534434',
  },
  legalDot: {
    fontSize: 10,
    color: '#d8c3ad',
  },
  // Failed
  failedIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  failedIconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedTitle: {
    fontFamily: fonts.interBold,
    fontSize: 22,
    color: '#131b2e',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  failedSubtitle: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: '#534434',
    marginTop: 8,
  },
  infoCallout: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f2f3ff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginTop: 20,
  },
  infoCalloutText: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    color: '#131b2e',
    lineHeight: 17.9,
  },
  boldInline: {
    fontFamily: fonts.interSemiBold,
  },
  unsuccessfulPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffdad6',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unsuccessfulDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ba1a1a',
  },
  unsuccessfulPillText: {
    fontFamily: fonts.interSemiBold,
    fontSize: 10,
    color: '#93000a',
  },
  attemptedPlanValue: {
    fontFamily: fonts.interSemiBold,
    fontSize: 15,
    color: '#131b2e',
    marginTop: 2,
  },
  attemptedPlanPrice: {
    fontFamily: fonts.interBold,
    fontSize: 16,
    color: '#131b2e',
  },
  failureReasonText: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: '#ba1a1a',
    marginTop: 2,
  },
  txnRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyIconButton: {
    backgroundColor: '#e2e7ff',
    borderRadius: 12,
    padding: 8,
  },
});
