import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import NavDashboardIcon from '../assets/icons/nav_dashboard.svg';
import NavReportsIcon from '../assets/icons/nav_reports.svg';
import NavSettingsIcon from '../assets/icons/nav_settings.svg';

const ICONS: Record<string, typeof NavDashboardIcon> = {
  Dashboard: NavDashboardIcon,
  Reports: NavReportsIcon,
  Settings: NavSettingsIcon,
};

const LABELS: Record<string, string> = {
  Dashboard: 'Dashboard',
  Reports: 'Reports',
  Settings: 'Settings',
};

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const tint = isActive ? colors.primary : colors.navInactive;
        const Icon = ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity key={route.key} style={styles.navItem} onPress={onPress}>
            <Icon width={24} height={24} color={tint} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {LABELS[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: colors.white,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: colors.navInactive,
  },
  navLabelActive: {
    color: colors.primary,
  },
});
