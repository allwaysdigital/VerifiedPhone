export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  OtpVerify: { phoneNumber: string };
  Register: undefined;
  MainTabs: undefined;
  DigitalSignature: undefined;
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
};

export type MainTabParamList = {
  Dashboard: undefined;
  Stock: undefined;
  AddPurchase: undefined;
  Reports: undefined;
  Settings: undefined;
};
