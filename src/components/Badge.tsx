import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type BadgeTone = 'available' | 'sold' | 'verified' | 'suspicious';

const TONE_COLORS: Record<BadgeTone, string> = {
  available: colors.green,
  sold: colors.blue,
  verified: colors.greenDark,
  suspicious: colors.primary,
};

export default function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <View style={[styles.badge, { backgroundColor: TONE_COLORS[tone] }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
