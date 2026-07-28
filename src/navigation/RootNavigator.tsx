import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import DigitalSignatureScreen from '../screens/DigitalSignatureScreen';
import DeviceDetailsScreen from '../screens/DeviceDetailsScreen';
import BrandsScreen from '../screens/BrandsScreen';
import AddBrandScreen from '../screens/AddBrandScreen';
import AddSaleScreen from '../screens/AddSaleScreen';
import InvoicePreviewScreen from '../screens/InvoicePreviewScreen';
import PoliceExportRecordScreen from '../screens/PoliceExportRecordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="DigitalSignature" component={DigitalSignatureScreen} />
        <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} />
        <Stack.Screen name="Brands" component={BrandsScreen} />
        <Stack.Screen name="AddBrand" component={AddBrandScreen} />
        <Stack.Screen name="AddSale" component={AddSaleScreen} />
        <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
        <Stack.Screen name="PoliceExportRecord" component={PoliceExportRecordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
