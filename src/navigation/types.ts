export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  OtpVerify: { phoneNumber: string };
  Register: undefined;
  MainTabs: undefined;
  DigitalSignature: undefined;
  DeviceDetails: { deviceId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Stock: undefined;
  AddPurchase: undefined;
  Reports: undefined;
  Settings: undefined;
};
