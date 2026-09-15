import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { DATE_PRESETS, formatDateForDisplay } from '../utils/dateRange';
import type { DateRangeFilterState } from '../hooks/useDateRangeFilter';

// Chips row ("All Time" / "Today" / "This Week" / ... / "Custom") plus the
// Custom-range modal — paired with useDateRangeFilter(). Lets any screen
// drop in the same date-scoping UI Stock Report established.
export default function DateRangeFilter({ state }: { state: DateRangeFilterState }) {
  return (
    <>
      <View style={styles.dateRow}>
        {DATE_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset}
            style={[styles.dateChip, state.datePreset === preset && styles.dateChipActive]}
            onPress={() => state.handleDatePresetPress(preset)}>
            <Text
              style={[
                styles.dateChipText,
                state.datePreset === preset && styles.dateChipTextActive,
              ]}>
              {preset === 'Custom' && state.datePreset === 'Custom'
                ? state.dateRangeLabel
                : preset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={state.customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => state.setCustomModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Date Range</Text>

            <Text style={styles.modalLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.modalDateField}
              onPress={() => {
                state.setCustomError(null);
                state.setActivePicker('start');
              }}>
              <Text style={styles.modalDateFieldText}>
                {formatDateForDisplay(state.pickerStartDate)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.modalDateField}
              onPress={() => {
                state.setCustomError(null);
                state.setActivePicker('end');
              }}>
              <Text style={styles.modalDateFieldText}>
                {formatDateForDisplay(state.pickerEndDate)}
              </Text>
            </TouchableOpacity>

            {state.activePicker ? (
              <DateTimePicker
                value={state.activePicker === 'start' ? state.pickerStartDate : state.pickerEndDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={state.handlePickerChange(state.activePicker)}
              />
            ) : null}

            {state.customError ? <Text style={styles.modalError}>{state.customError}</Text> : null}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => state.setCustomModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyButton} onPress={state.handleApplyCustomRange}>
                <Text style={styles.modalApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
  },
  dateChipTextActive: {
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  modalDateField: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalDateFieldText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  modalError: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: 10,
    marginTop: -4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modalApplyButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
