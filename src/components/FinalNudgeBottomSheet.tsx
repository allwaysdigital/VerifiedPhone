import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { AlertTriangleIcon } from './SubscriptionIcons';

type Props = {
  visible: boolean;
  entriesUsed: number;
  entryLimit: number;
  onChoosePlan: () => void;
  onLater: () => void;
};

// Shown once a dealer uses their last free purchase entry — sits as a
// dimmed overlay on top of whatever screen triggered it (per Figma spec,
// the Dashboard). Real trigger wiring (watching the actual entry count)
// comes later alongside Razorpay; for now this is driven by the `visible`
// prop a caller controls.
export default function FinalNudgeBottomSheet({
  visible,
  entriesUsed,
  entryLimit,
  onChoosePlan,
  onLater,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.iconBadge}>
            <AlertTriangleIcon size={32} />
          </View>

          <View style={styles.counterPill}>
            <Text style={styles.counterPillText}>
              {entriesUsed} of {entryLimit} Free Entries Used
            </Text>
          </View>

          <Text style={styles.title}>This was your last free purchase entry</Text>
          <Text style={styles.body}>
            To add new purchases, you'll need a plan. Your saved records and PDFs always stay
            available.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onChoosePlan} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Choose Plan</Text>
            <Text style={styles.primaryButtonArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterButton} onPress={onLater} activeOpacity={0.7}>
            <Text style={styles.laterButtonText}>Later</Text>
          </TouchableOpacity>

          <View style={styles.homeIndicator} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  dragHandleWrap: {
    paddingBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#d1d5db',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  counterPill: {
    backgroundColor: '#fef3c7',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 8,
  },
  counterPillText: {
    fontFamily: fonts.robotoBold,
    fontSize: 11,
    color: '#92400e',
  },
  title: {
    fontFamily: fonts.robotoBold,
    fontSize: 20,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 27.5,
  },
  body: {
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22.75,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f59e0b',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
  },
  primaryButtonText: {
    fontFamily: fonts.robotoBold,
    fontSize: 16,
    color: colors.white,
  },
  primaryButtonArrow: {
    fontSize: 18,
    color: colors.white,
  },
  laterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
    marginTop: 10,
  },
  laterButtonText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: '#4b5563',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    borderRadius: 9999,
    backgroundColor: '#d1d5db',
    marginTop: 16,
  },
});
