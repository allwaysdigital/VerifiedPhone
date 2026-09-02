import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { filterDevices } from '../utils/deviceFilter';
import { buildStockReportHtml, computeModelRows, computeStockReportStats } from '../utils/stockReport';
import { formatINR } from '../utils/format';
import {
  DATE_PRESETS,
  formatDateForDisplay,
  isDateInRange,
  type CustomRange,
  type DatePreset,
} from '../utils/dateRange';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'StockReportPreview'>;

function StatBox({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

export default function StockReportPreviewScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices, shop } = useShopData();
  const { filter, query, brand } = route.params;
  const [isDownloading, setIsDownloading] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePreset>(route.params.datePreset ?? 'All Time');
  const [customRange, setCustomRange] = useState<CustomRange>({
    startIso: route.params.customStartIso ?? null,
    endIso: route.params.customEndIso ?? null,
  });

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [pickerStartDate, setPickerStartDate] = useState<Date>(new Date());
  const [pickerEndDate, setPickerEndDate] = useState<Date>(new Date());
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const [generatedAt] = useState(() =>
    new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  );

  // Date scope filters by purchase date — the report is framed around
  // stock intake ("what came in during this period"), so a device counts
  // toward a period based on when it was purchased, not when (or whether)
  // it later sold. This is a *stock* report — once a device sells it's no
  // longer stock, so it's dropped here regardless of the incoming filter;
  // sales/profit already have their own dedicated reports (Sale History,
  // Profit Overview).
  const reportDevices = useMemo(() => {
    const base = filterDevices(devices, filter, query, brand);
    return base
      .filter(device => device.status !== 'Sold')
      .filter(device => isDateInRange(device.purchaseDate, datePreset, customRange));
  }, [devices, filter, query, brand, datePreset, customRange]);
  const stats = useMemo(() => computeStockReportStats(reportDevices), [reportDevices]);
  // Once scoped to a single brand, every brand row would just repeat that
  // one brand — swap the breakdown to per-model so it's actually useful.
  const modelRows = useMemo(
    () => (brand ? computeModelRows(reportDevices) : []),
    [brand, reportDevices],
  );

  const dateRangeLabel =
    datePreset === 'Custom' && customRange.startIso && customRange.endIso
      ? `${formatDateForDisplay(new Date(customRange.startIso))} – ${formatDateForDisplay(new Date(customRange.endIso))}`
      : datePreset;

  // The brand is already the headline of the card above, so the filter
  // line only needs to add what that headline doesn't already say. This
  // report always excludes sold devices, so "Sold" isn't a meaningful
  // value here even if that was the tab the dealer had open.
  const filterLabel = [
    'In stock',
    query.trim() ? `matching "${query.trim()}"` : null,
    datePreset !== 'All Time' ? dateRangeLabel : null,
  ]
    .filter(Boolean)
    .join(' · ');

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
  const handlePickerChange = (target: 'start' | 'end') => (event: DateTimePickerEvent, selected?: Date) => {
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

  // Drilling into a brand from the breakdown table pushes a fresh report
  // scoped to just that brand, carrying the current tab/search/date scope
  // forward — back returns to the broader report this was reached from.
  const handleBrandRowPress = (rowBrand: string) => {
    if (rowBrand === brand) {
      return;
    }
    navigation.push('StockReportPreview', {
      filter,
      query,
      brand: rowBrand,
      datePreset,
      customStartIso: customRange.startIso ?? undefined,
      customEndIso: customRange.endIso ?? undefined,
    });
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) {
      return;
    }
    if (reportDevices.length === 0) {
      Alert.alert('No devices to report', 'There are no devices matching the current filter.');
      return;
    }
    setIsDownloading(true);
    try {
      const html = buildStockReportHtml({ devices: reportDevices, filterLabel, shop, generatedAt, brand });
      const fileName = `StockReport-${Date.now()}`;
      const { filePath } = await generatePDF({ html, fileName });
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        filename: fileName,
        saveToFiles: true,
      });
    } catch (error: any) {
      if (!error?.message?.includes('User did not share')) {
        console.error('Stock report PDF generation failed:', error);
        Alert.alert(
          'Download failed',
          error?.message ?? 'Could not generate the stock report PDF. Please try again.',
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{brand ? `${brand} Report` : 'Stock Report'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.shopHeader}>
            <View style={styles.shopIconWrap}>
              <InvoiceIcon width={26} height={26} color={colors.primary} />
            </View>
            {brand ? (
              <>
                <Text style={styles.shopName}>{brand}</Text>
                <Text style={styles.shopMeta}>{shop?.shopName || 'My Shop'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.shopName}>{shop?.shopName || 'My Shop'}</Text>
                {shop?.address ? <Text style={styles.shopMeta}>{shop.address}</Text> : null}
                {shop?.contactNumber || shop?.phoneNumber ? (
                  <Text style={styles.shopMeta}>Contact: {shop.contactNumber || shop.phoneNumber}</Text>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Filter: {filterLabel}</Text>
              <Text style={styles.metaText}>Generated: {generatedAt}</Text>
            </View>

            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateRow}>
              {DATE_PRESETS.map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.dateChip, datePreset === preset && styles.dateChipActive]}
                  onPress={() => handleDatePresetPress(preset)}>
                  <Text
                    style={[
                      styles.dateChipText,
                      datePreset === preset && styles.dateChipTextActive,
                    ]}>
                    {preset === 'Custom' && datePreset === 'Custom' ? dateRangeLabel : preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Summary</Text>
            {/* This is a stock (inventory) report, not a sales one — sold
                devices are excluded above, so Available/Sold and Sale
                Value/Net Profit would always read as "all" and "zero".
                Sale History and Profit Overview cover that ground instead. */}
            <View style={styles.statsRow}>
              <StatBox label="Devices In Stock" value={String(stats.totalDevices)} valueColor={colors.green} />
              <StatBox label="Purchase Value" value={formatINR(stats.totalPurchaseValue)} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              {brand ? 'Model-wise Breakdown' : 'Brand-wise Breakdown'}
            </Text>
            {brand ? (
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.tableBrandCol]}>Model</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableNumCol]}>Units</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableValueCol]}>Purchase Value</Text>
                </View>
                {modelRows.map(row => {
                  const specs = [...row.storageOptions, ...row.ramOptions, ...row.conditions].join(
                    ' · ',
                  );
                  return (
                    <View key={row.model} style={styles.tableRow}>
                      <View style={styles.tableBrandCol}>
                        <Text style={styles.tableCell}>{row.model}</Text>
                        {specs ? <Text style={styles.tableSubCell}>{specs}</Text> : null}
                      </View>
                      <Text style={[styles.tableCell, styles.tableNumCol]}>{row.units}</Text>
                      <Text style={[styles.tableCell, styles.tableValueCol]}>
                        {formatINR(row.purchaseValue)}
                      </Text>
                    </View>
                  );
                })}
                {modelRows.length === 0 ? (
                  <Text style={styles.tableEmptyText}>No devices in this range.</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.tableBrandCol]}>Brand</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableNumCol]}>Units</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableValueCol]}>Purchase Value</Text>
                </View>
                {stats.brandRows.map(row => (
                  <TouchableOpacity
                    key={row.brand}
                    style={styles.tableRow}
                    onPress={() => handleBrandRowPress(row.brand)}>
                    <Text style={[styles.tableCell, styles.tableBrandCol]}>{row.brand}</Text>
                    <Text style={[styles.tableCell, styles.tableNumCol]}>{row.units}</Text>
                    <Text style={[styles.tableCell, styles.tableValueCol]}>
                      {formatINR(row.purchaseValue)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, isDownloading && styles.buttonDisabled]}
          onPress={handleDownloadPdf}
          disabled={isDownloading}>
          <Text style={styles.downloadButtonText}>
            {isDownloading ? 'Generating…' : 'Download PDF'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Date Range</Text>

            <Text style={styles.modalLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.modalDateField}
              onPress={() => {
                setCustomError(null);
                setActivePicker('start');
              }}>
              <Text style={styles.modalDateFieldText}>{formatDateForDisplay(pickerStartDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.modalDateField}
              onPress={() => {
                setCustomError(null);
                setActivePicker('end');
              }}>
              <Text style={styles.modalDateFieldText}>{formatDateForDisplay(pickerEndDate)}</Text>
            </TouchableOpacity>

            {activePicker ? (
              <DateTimePicker
                value={activePicker === 'start' ? pickerStartDate : pickerEndDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={handlePickerChange(activePicker)}
              />
            ) : null}

            {customError ? <Text style={styles.modalError}>{customError}</Text> : null}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setCustomModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyButton} onPress={handleApplyCustomRange}>
                <Text style={styles.modalApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  shopHeader: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
    gap: 4,
  },
  shopIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  shopMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  cardBody: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metaText: {
    fontSize: 12,
    color: colors.textFaint,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 10.5,
    color: colors.textFaint,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginVertical: 16,
  },
  table: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBg,
  },
  tableHeaderCell: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBg,
  },
  tableCell: {
    fontSize: 13,
    color: colors.text,
  },
  tableSubCell: {
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 2,
  },
  tableEmptyText: {
    fontSize: 13,
    color: colors.textFaint,
    paddingVertical: 12,
    textAlign: 'center',
  },
  tableBrandCol: {
    flex: 1.4,
  },
  tableNumCol: {
    flex: 0.8,
    textAlign: 'right',
  },
  tableValueCol: {
    flex: 1.4,
    textAlign: 'right',
  },
  downloadButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
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
