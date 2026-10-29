import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import HeaderLogo from '../assets/icons/header_logo.svg';
import BackArrowIcon from '../assets/icons/back_arrow.svg';
import { HelpIcon } from './SubscriptionIcons';

type Props = {
  // 'tall' matches the Dashboard-style branded header (logo + shop name +
  // wordmark, no back button) — used where this screen feels like "home".
  // 'short' matches the in-flow checkout header (back button + plain
  // title + optional subtitle) — used mid payment/settings flows.
  variant: 'tall' | 'short';
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  onHelpPress?: () => void;
};

export default function SubscriptionHeader({ variant, title, subtitle, onBack, onHelpPress }: Props) {
  const insets = useSafeAreaInsets();
  const isTall = variant === 'tall';

  return (
    <View
      style={[
        styles.header,
        isTall ? styles.headerTall : styles.headerShort,
        { paddingTop: insets.top + (isTall ? 16 : 10) },
      ]}>
      <View style={styles.row}>
        {isTall ? (
          <HeaderLogo width={32} height={32} />
        ) : (
          <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backButton}>
            <BackArrowIcon width={22} height={22} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={isTall ? styles.titleTall : styles.titleShort}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity style={styles.helpPill} onPress={onHelpPress} hitSlop={6}>
          <HelpIcon size={13} />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerGradientStart,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
  },
  headerTall: {
    paddingBottom: 24,
  },
  headerShort: {
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  titleTall: {
    fontFamily: fonts.interMedium,
    fontSize: 20,
    color: colors.white,
  },
  titleShort: {
    fontFamily: fonts.interSemiBold,
    fontSize: 16,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.robotoRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  helpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  helpText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
});
