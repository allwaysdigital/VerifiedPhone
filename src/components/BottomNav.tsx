import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import NavDashboardIcon from '../assets/icons/nav_dashboard.svg';
import NavStockIcon from '../assets/icons/nav_stock.svg';
import NavAddIcon from '../assets/icons/nav_add.svg';
import NavReportsIcon from '../assets/icons/nav_reports.svg';
import NavSettingsIcon from '../assets/icons/nav_settings.svg';

const ICONS: Record<string, typeof NavDashboardIcon> = {
  Dashboard: NavDashboardIcon,
  Stock: NavStockIcon,
  AddPurchase: NavAddIcon,
  Reports: NavReportsIcon,
  Settings: NavSettingsIcon,
};

const LABELS: Record<string, string> = {
  Dashboard: 'Dashboard',
  Stock: 'Stock',
  AddPurchase: 'Add',
  Reports: 'Reports',
  Settings: 'Settings',
};

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bottomNav}>
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
