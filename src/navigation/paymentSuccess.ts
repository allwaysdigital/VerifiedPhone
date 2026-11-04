import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

// After a confirmed payment the checkout screens behind it are stale, so the
// stack becomes Settings → Subscription & Billing → success: back from the
// success screen lands on billing, and back again leaves, never looping.
export function resetToPaymentSuccess(
  navigation: Pick<NativeStackNavigationProp<RootStackParamList>, 'reset'>,
  params: Omit<RootStackParamList['PaymentStatus'], 'status'>,
) {
  navigation.reset({
    index: 2,
    routes: [
      { name: 'MainTabs', params: { screen: 'Settings' } },
      { name: 'ManageSubscription' },
      { name: 'PaymentStatus', params: { ...params, status: 'success' } },
    ],
  });
}
