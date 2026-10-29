import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import SubscriptionHeader from '../components/SubscriptionHeader';
import {
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  DownloadIcon,
  ReceiptCheckIcon,
  SupportHeadsetIcon,
  XCircleIcon,
} from '../components/SubscriptionIcons';
import { PLANS, formatSubscriptionDate } from '../types/domain';
import { useShopData } from '../context/ShopDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSubscription'>;

// No billing-history endpoint exists yet — these rows are placeholder data
// shaped like what the real invoice history will look like, so the layout
// is ready once that's wired up.
const MOCK_INVOICES = [
  {
    id: 'INV-2026-02-094',
    label: 'Monthly Plan',
    date: '25 Feb 2026',
    method: 'UPI AutoPay',
    amount: 199,
    status: 'paid' as const,
  },
  {
    id: 'INV-2026-01-081',
    label: 'Monthly Plan',
    date: '25 Jan 2026',
    method: 'UPI AutoPay',
    amount: 199,
    status: 'paid' as const,
  },
  {
    id: null,
    label: 'Monthly Plan',
    date: '25 Dec 2025',
    method: 'Bank Declined',
    amount: 199,
    status: 'failed' as const,
  },
];

export default function ManageSubscriptionScreen({ navigation }: Props) {
  useScreenStatusBar('light-content', colors.headerGradientStart);
  const { shop, subscription, cancelSubscription } = useShopData();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const plan = subscription?.planId ? PLANS[subscription.planId] : null;
  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const hasAccess = isTrial || isActive;
  const renewDate = subscription?.trialEndsAt ? formatSubscriptionDate(subscription.trialEndsAt) : '—';

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SubscriptionHeader
        variant="short"
        title="Subscription & Billing"
        subtitle={`${shop?.shopName || 'My Shop'} · Dealer Sathi`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.planHeaderRow}>
            <View>
              <View style={styles.planLabelRow}>
                <Text style={styles.currentPlanLabel}>CURRENT PLAN</Text>
                <View style={[styles.statusPill, !hasAccess && styles.statusPillInactive]}>
                  <View style={[styles.statusDot, !hasAccess && styles.statusDotInactive]} />
                  <Text style={[styles.statusPillText, !hasAccess && styles.statusPillTextInactive]}>
                    {isActive ? 'Active' : isTrial ? 'Trial' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <Text style={styles.planHeading}>
                {plan ? `${isActive ? 'Active' : 'Trial'} ${plan.id === 'yearly' ? 'yearly' : 'monthly'}` : 'No plan selected'}
              </Text>
            </View>
            {plan ? (
              <View style={styles.priceWrap}>
                <Text style={styles.priceValue}>₹{plan.price.toLocaleString('en-IN')}</Text>
                <Text style={styles.priceSuffix}>/ {plan.id === 'yearly' ? 'year' : 'month'}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.renewalRow}>
            <View style={styles.renewalIconWrap}>
              <ClockIcon size={16} color="#92400e" />
            </View>
            <View>
              <Text style={styles.renewalLabel}>Status & Renewal</Text>
              <Text style={styles.renewalValue}>
                {hasAccess ? `Renews on ${renewDate}` : 'No upcoming renewal'}
                {plan ? ` · ₹${plan.price.toLocaleString('en-IN')}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.perksBox}>
            <View style={styles.perkRow}>
              <CheckCircleIcon size={16} />
              <Text style={styles.perkText}>Unlimited purchase entries</Text>
            </View>
            <View style={styles.perkRow}>
              <CheckCircleIcon size={16} />
              <Text style={styles.perkText}>WhatsApp PDF sharing unlocked</Text>
            </View>
            <View style={styles.perkRow}>
              <CheckCircleIcon size={16} />
              <Text style={styles.perkText}>Priority GST invoice verification</Text>
            </View>
          </View>

          {hasAccess ? (
            <>
              <TouchableOpacity
                style={styles.switchButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('SubscriptionPlans')}>
                <Text style={styles.switchButtonText}>Switch to Yearly</Text>
                <View style={styles.switchSavingsChip}>
                  <Text style={styles.switchSavingsChipText}>Save 16% (₹1,999/yr)</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelTextButton}
                onPress={() => setCancelModalVisible(true)}>
                <Text style={styles.cancelTextButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.switchButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SubscriptionPlans')}>
              <Text style={styles.switchButtonText}>Choose a Plan</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.billingHeaderRow}>
          <Text style={styles.billingHeading}>Billing History</Text>
          <Text style={styles.allTransactions}>All Transactions</Text>
        </View>

        <View style={styles.invoiceList}>
          {MOCK_INVOICES.map((invoice, index) => (
            <View key={`${invoice.label}-${index}`} style={styles.invoiceRow}>
              <View style={styles.invoiceLeft}>
                <View
                  style={[
                    styles.invoiceIconWrap,
                    invoice.status === 'failed' && styles.invoiceIconWrapFailed,
                  ]}>
                  {invoice.status === 'paid' ? (
                    <ReceiptCheckIcon size={18} />
                  ) : (
                    <XCircleIcon size={18} />
                  )}
                </View>
                <View>
                  <View style={styles.invoiceTitleRow}>
                    <Text style={styles.invoiceLabel}>{invoice.label}</Text>
                    <View
                      style={[
                        styles.invoiceStatusChip,
                        invoice.status === 'failed' && styles.invoiceStatusChipFailed,
                      ]}>
                      <Text
                        style={[
                          styles.invoiceStatusChipText,
                          invoice.status === 'failed' && styles.invoiceStatusChipTextFailed,
                        ]}>
                        {invoice.status === 'paid' ? 'Paid' : 'Failed'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.invoiceMeta}>
                    {invoice.date} · {invoice.method}
                  </Text>
                  <Text style={styles.invoiceId}>{invoice.id || 'No receipt'}</Text>
                </View>
              </View>
              <View style={styles.invoiceRight}>
                <Text style={[styles.invoiceAmount, invoice.status === 'failed' && styles.invoiceAmountFailed]}>
                  ₹{invoice.amount}
                </Text>
                {invoice.status === 'paid' ? (
                  <TouchableOpacity style={styles.gstButton}>
                    <DownloadIcon size={12} />
                    <Text style={styles.gstButtonText}>GST</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.captionRow}>
          <ClockIcon size={16} color="#64748b" />
          <Text style={styles.captionText}>
            Invoices use the GST details from your shop profile. If skipped during onboarding, you
            can update it under shop settings.
          </Text>
        </View>

        <TouchableOpacity style={styles.supportCard} onPress={() => navigation.navigate('AppSupport')}>
          <View style={styles.supportLeft}>
            <View style={styles.supportIconWrap}>
              <SupportHeadsetIcon size={16} />
            </View>
            <Text style={styles.supportText}>Need help with billing or GST invoice?</Text>
          </View>
          <View style={styles.supportLinkRow}>
            <Text style={styles.supportLinkText}>Support</Text>
            <ChevronRightIcon size={13} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isTrial ? 'Cancel Trial?' : 'Cancel Subscription?'}</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to cancel your {isTrial ? 'trial' : 'subscription'}?
            </Text>
            <Text style={styles.modalNote}>
              You'll lose access to all premium features after {renewDate}.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalNoButton} onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.modalNoButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={handleConfirmCancel}
                disabled={cancelling}>
                <Text style={styles.modalYesButtonText}>{cancelling ? 'Cancelling…' : 'Yes, Cancel'}</Text>
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
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 17,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  planLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPlanLabel: {
    fontFamily: fonts.robotoBold,
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusPillInactive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusDotInactive: {
    backgroundColor: '#94a3b8',
  },
  statusPillText: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: '#047857',
  },
  statusPillTextInactive: {
    color: '#64748b',
  },
  planHeading: {
    fontFamily: fonts.robotoBold,
    fontSize: 18,
    color: '#0f172a',
    marginTop: 4,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontFamily: fonts.robotoBold,
    fontSize: 24,
    color: '#0f172a',
  },
  priceSuffix: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 3,
  },
  renewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  renewalIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewalLabel: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#64748b',
  },
  renewalValue: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: '#1e293b',
    marginTop: 1,
  },
  perksBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 13,
    gap: 8,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#334155',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 24,
  },
  switchButtonText: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: colors.white,
  },
  switchSavingsChip: {
    backgroundColor: 'rgba(180,83,9,0.4)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  switchSavingsChipText: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: colors.white,
  },
  cancelTextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  cancelTextButtonText: {
    fontFamily: fonts.robotoBold,
    fontSize: 12,
    color: '#e11d48',
  },
  billingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  billingHeading: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: '#0f172a',
    letterSpacing: -0.35,
  },
  allTransactions: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: '#94a3b8',
  },
  invoiceList: {
    gap: 10,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  invoiceLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  invoiceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceIconWrapFailed: {
    backgroundColor: '#fff1f2',
  },
  invoiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceLabel: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: '#0f172a',
  },
  invoiceStatusChip: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  invoiceStatusChipFailed: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  invoiceStatusChipText: {
    fontFamily: fonts.robotoBold,
    fontSize: 10,
    color: '#047857',
  },
  invoiceStatusChipTextFailed: {
    color: '#be123c',
  },
  invoiceMeta: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  invoiceId: {
    fontFamily: fonts.robotoRegular,
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  invoiceAmount: {
    fontFamily: fonts.robotoBold,
    fontSize: 14,
    color: '#0f172a',
  },
  invoiceAmountFailed: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  gstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.6)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  gstButtonText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 11,
    color: '#d97706',
  },
  captionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  captionText: {
    flex: 1,
    fontFamily: fonts.robotoRegular,
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16.5,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 13,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  supportIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  supportLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  supportLinkText: {
    fontFamily: fonts.robotoBold,
    fontSize: 12,
    color: '#d97706',
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
