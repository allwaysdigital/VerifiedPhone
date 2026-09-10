import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { CalendarIcon, CardIcon, PhoneOutlineIcon } from '../components/SubscriptionIcons';
import { PLANS, formatSubscriptionDate } from '../types/domain';
import { useShopData } from '../context/ShopDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TrialActivated'>;

export default function TrialActivatedScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { subscription } = useShopData();
  const plan = PLANS[route.params.planId];
  const trialEndsDate = subscription?.trialEndsAt
    ? formatSubscriptionDate(subscription.trialEndsAt)
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Trial Activated!</Text>
        <Text style={styles.subtitle}>Welcome to {plan.name}</Text>
        <Text style={styles.description}>Enjoy all premium features free for 1 month</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <PhoneOutlineIcon size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.rowLabel}>Your Plan</Text>
              <Text style={styles.rowValue}>{plan.name}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <CalendarIcon size={20} color={colors.green} />
            <View>
              <Text style={styles.rowLabel}>FREE Trial Period</Text>
              <Text style={styles.rowValue}>Now - {trialEndsDate}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <CardIcon size={20} color={colors.blue} />
            <View>
              <Text style={styles.rowLabel}>First Payment</Text>
              <Text style={styles.rowValue}>
                ₹{plan.price.toLocaleString('en-IN')} on {trialEndsDate}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.footnote}>
            Cancel anytime during trial period with no charges
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate('ManageSubscription')}>
          <Text style={styles.manageButtonText}>Manage Subscription</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkMark: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 20,
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textFaint,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginVertical: 4,
  },
  footnote: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 10,
  },
  manageButton: {
    width: '100%',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
