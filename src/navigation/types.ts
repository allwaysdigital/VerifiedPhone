import type { ConfirmationResult } from '@react-native-firebase/auth';
import type { PlanId } from '../types/domain';

export type PendingShopDetails = {
  shopName: string;
  gstNumber: string;
  address: string;
  contactNumber: string;
  shopLogoUri: string | null;
};

export type PendingPurchaseData = {
  brand: string;
  model: string;
  color: string;
  ram: string;
  storage: string;
  condition: string;
  batteryHealth: string;
  imei1: string;
  imei2: string;
  purchasePrice: string;
  expectedSale: string;
  accessories: string[];
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  phoneFrontImage: string | null;
  phoneBackImage: string | null;
  oldPhoneBill: string | null;
  aadhaarFront: string | null;
  aadhaarBack: string | null;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: { pendingShopDetails?: PendingShopDetails } | undefined;
  OtpVerify: {
    dialCode: string;
    phoneNumber: string;
    confirmation: ConfirmationResult;
    pendingShopDetails?: PendingShopDetails;
  };
  Register: undefined;
  MainTabs: undefined;
  DigitalSignature: { purchaseData: PendingPurchaseData };
  DeviceDetails: { deviceId: string };
  Brands: undefined;
  AddBrand: undefined;
  AddSale: { deviceId?: string } | undefined;
  InvoicePreview: {
    deviceId: string;
    customerName: string;
    customerMobile: string;
    customerAddress: string;
    salePrice: number;
    warrantyPeriod: string;
  };
  PoliceExportRecord: { deviceId: string };
  SubscriptionPlans: undefined;
  PlanDetail: { planId: PlanId };
  TrialActivated: { planId: PlanId };
  ManageSubscription: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Stock: { searchQuery?: string } | undefined;
  AddPurchase: undefined;
  Reports: undefined;
  Settings: undefined;
};
