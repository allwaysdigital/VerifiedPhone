import { Platform } from 'react-native';

export const fonts = {
  robotoRegular: 'Roboto-Regular',
  robotoMedium: 'Roboto-Medium',
  robotoSemiBold: 'Roboto-SemiBold',
  robotoBold: 'Roboto-Bold',

  manropeRegular: 'Manrope-Regular',
  manropeSemiBold: 'Manrope-SemiBold',
  manropeBold: 'Manrope-Bold',

  nunitoSansRegular: 'NunitoSans-Regular',
  nunitoSansSemiBold: 'NunitoSans-SemiBold',
  nunitoSansBold: 'NunitoSans-Bold',

  interRegular: 'Inter-Regular',
  interMedium: 'Inter-Medium',
  interSemiBold: 'Inter-SemiBold',
  interBold: 'Inter-Bold',

  // Figma spec uses "SF Pro", Apple's system font — can't be bundled for
  // Android (licensed for Apple platforms only). iOS already renders SF Pro
  // as its system font by default, so `undefined` there keeps that; Android
  // falls back to Roboto, the closest open equivalent.
  sfProRegular: Platform.select({ ios: undefined, default: 'Roboto-Regular' }),
  sfProSemiBold: Platform.select({ ios: undefined, default: 'Roboto-SemiBold' }),
};
