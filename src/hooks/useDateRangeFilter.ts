import { useState } from 'react';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatDateForDisplay, type CustomRange, type DatePreset } from '../utils/dateRange';

// Everything a "date range chips + Custom modal" filter needs — shared by
// any screen that lets the dealer scope a list/report to All Time, Today,
// This Week, etc. (Stock Report was first; Purchase/Sale/Profit History
// reuse it here rather than re-implementing the same picker plumbing).
export function useDateRangeFilter(initial?: {
  datePreset?: DatePreset;
  customRange?: CustomRange;
}) {
  const [datePreset, setDatePreset] = useState<DatePreset>(initial?.datePreset ?? 'All Time');
  const [customRange, setCustomRange] = useState<CustomRange>(
    initial?.customRange ?? { startIso: null, endIso: null },
  );

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [pickerStartDate, setPickerStartDate] = useState<Date>(new Date());
  const [pickerEndDate, setPickerEndDate] = useState<Date>(new Date());
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const dateRangeLabel =
    datePreset === 'Custom' && customRange.startIso && customRange.endIso
      ? `${formatDateForDisplay(new Date(customRange.startIso))} – ${formatDateForDisplay(new Date(customRange.endIso))}`
      : datePreset;

  const handleDatePresetPress = (preset: DatePreset) => {
    if (preset === 'Custom') {
      setPickerStartDate(customRange.startIso ? new Date(customRange.startIso) : new Date());
      setPickerEndDate(customRange.endIso ? new Date(customRange.endIso) : new Date());
      setCustomError(null);
      setCustomModalVisible(true);
      return;
    }
    setDatePreset(preset);
  };

  // Android's date picker is its own system dialog — `activePicker` tracks
  // which field opened it, since only one shows at a time.
  const handlePickerChange =
    (target: 'start' | 'end') => (event: DateTimePickerEvent, selected?: Date) => {
      setActivePicker(null);
      if (event.type !== 'set' || !selected) {
        return;
      }
      if (target === 'start') {
        setPickerStartDate(selected);
      } else {
        setPickerEndDate(selected);
      }
    };

  const handleApplyCustomRange = () => {
    if (pickerStartDate > pickerEndDate) {
      setCustomError('Start date must be before end date.');
      return;
    }
    setCustomRange({ startIso: pickerStartDate.toISOString(), endIso: pickerEndDate.toISOString() });
    setDatePreset('Custom');
    setCustomModalVisible(false);
  };

  return {
    datePreset,
    customRange,
    dateRangeLabel,
    customModalVisible,
    setCustomModalVisible,
    pickerStartDate,
    pickerEndDate,
    activePicker,
    setActivePicker,
    customError,
    setCustomError,
    handleDatePresetPress,
    handlePickerChange,
    handleApplyCustomRange,
  };
}

export type DateRangeFilterState = ReturnType<typeof useDateRangeFilter>;
