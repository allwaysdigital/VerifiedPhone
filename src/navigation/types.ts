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
  DeviceHistory: { imei1: string };
  Brands: undefined;
  AddBrand: undefined;
  AddSale: { deviceId?: string } | undefined;
  Stock: undefined;
  StockList: { brand?: string; searchQuery?: string } | undefined;
  StockReportPreview: {
    filter: 'All' | 'Available' | 'Sold';
    query: string;
    brand?: string;
    datePreset?: 'All Time' | 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom';
    customStartIso?: string;
    customEndIso?: string;
  };
  AddPurchase: undefined;
  PurchaseList: undefined;
  SaleList: undefined;
  ProfitList: undefined;
  TransactionReportPreview: {
    mode: 'purchase' | 'sale' | 'profit';
    query: string;
    datePreset?: 'All Time' | 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom';
    customStartIso?: string;
    customEndIso?: string;
  };
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
  AppSupport: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Reports: undefined;
  Settings: undefined;
};
