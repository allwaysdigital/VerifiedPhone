import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import { formatINR } from '../utils/format';
import { isDateInRange } from '../utils/dateRange';
import { useDateRangeFilter } from '../hooks/useDateRangeFilter';
import DateRangeFilter from '../components/DateRangeFilter';
import { buildTransactionReportHtml } from '../utils/transactionReport';
import {
  TRANSACTION_MODE_META,
  matchesTransactionQuery,
  selectTransactionDevices,
  transactionDateField,
} from '../utils/transactions';
import type { Device } from '../types/domain';
import BackButton from '../components/BackButton';
import InvoiceIcon from '../assets/icons/invoice_icon.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionReportPreview'>;

function StatBox({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

// A row per device — same "name/amount on top, detail line below" shape
// TransactionListScreen's rows use, so the preview reads like a natural
// continuation of the list the dealer just filtered.
function ReportRow({ mode, device }: { mode: Props['route']['params']['mode']; device: Device }) {
  const amount =
    mode === 'purchase'
      ? { text: formatINR(device.purchasePrice), color: colors.text }
      : mode === 'sale'
      ? { text: formatINR(device.salePrice ?? 0), color: colors.greenDark }
      : {
          text: `${device.profit >= 0 ? '+' : ''}${formatINR(device.profit)}`,
          color: device.profit >= 0 ? colors.greenDark : colors.danger,
        };

  const meta =
    mode === 'purchase'
      ? `Purchased ${device.purchaseDate || '—'} • ${device.sellerName}`
      : mode === 'sale'
      ? `Sold ${device.saleDate || '—'} • ${device.buyerName || 'Buyer not recorded'}`
      : `${device.profitPercent}% margin • Sold ${device.saleDate || '—'}`;

  return (
    <View style={styles.tableRow}>
      <View style={styles.rowTopLine}>
        <Text style={styles.rowModel} numberOfLines={1}>
          {device.brand} {device.model}
        </Text>
        <Text style={[styles.rowAmount, { color: amount.color }]}>{amount.text}</Text>
      </View>
      <Text style={styles.rowMeta} numberOfLines={1}>
        {meta}
      </Text>
    </View>
  );
}

export default function TransactionReportPreviewScreen({ navigation, route }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { devices, shop } = useShopData();
  const { mode, query } = route.params;
  const meta = TRANSACTION_MODE_META[mode];
  const [isDownloading, setIsDownloading] = useState(false);

  const dateFilter = useDateRangeFilter({
    datePreset: route.params.datePreset,
    customRange: {
      startIso: route.params.customStartIso ?? null,
      endIso: route.params.customEndIso ?? null,
    },
  });

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

  const reportDevices = useMemo(() => {
    return selectTransactionDevices(mode, devices)
      .filter(d => matchesTransactionQuery(d, query))
      .filter(d =>
        isDateInRange(transactionDateField(mode, d), dateFilter.datePreset, dateFilter.customRange),
      );
  }, [devices, mode, query, dateFilter.datePreset, dateFilter.customRange]);

  const total = meta.summaryValue(reportDevices);

  const filterLabel = [
    dateFilter.datePreset !== 'All Time' ? dateFilter.dateRangeLabel : 'All Time',
    query.trim() ? `matching "${query.trim()}"` : null,
  ]
    .filter(Boolean)
    .join(' · ');

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
      const html = buildTransactionReportHtml({
        mode,
        devices: reportDevices,
        shop,
        filterLabel,
        generatedAt,
      });
      const fileName = `${meta.title.replace(/\s+/g, '')}-${Date.now()}`;
      const { filePath } = await generatePDF({ html, fileName });
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        filename: fileName,
        saveToFiles: true,
      });
    } catch (error: any) {
      if (!error?.message?.includes('User did not share')) {
        console.error('Transaction report PDF generation failed:', error);
        Alert.alert(
          'Download failed',
          error?.message ?? 'Could not generate the report PDF. Please try again.',
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
        <Text style={styles.headerTitle}>{meta.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={[styles.shopHeader, { backgroundColor: meta.accent }]}>
            <View style={styles.shopIconWrap}>
              <InvoiceIcon width={26} height={26} color={meta.accent} />
            </View>
            <Text style={styles.shopName}>{meta.title}</Text>
            <Text style={styles.shopMeta}>{shop?.shopName || 'My Shop'}</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Filter: {filterLabel}</Text>
              <Text style={styles.metaText}>Generated: {generatedAt}</Text>
            </View>

            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateRangeSpacing}>
              <DateRangeFilter state={dateFilter} />
            </View>

            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.statsRow}>
              <StatBox label={meta.summaryLabel} value={formatINR(total)} valueColor={meta.accent} />
              <StatBox label="Devices" value={String(reportDevices.length)} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>{meta.title}</Text>
            <View style={styles.table}>
              {reportDevices.map((device, index) => (
                <React.Fragment key={device.id}>
                  {index > 0 ? <View style={styles.rowDivider} /> : null}
                  <ReportRow mode={mode} device={device} />
                </React.Fragment>
              ))}
              {reportDevices.length === 0 ? (
                <Text style={styles.tableEmptyText}>No devices in this range.</Text>
              ) : null}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.downloadButton,
            { backgroundColor: meta.accent },
            isDownloading && styles.buttonDisabled,
          ]}
          onPress={handleDownloadPdf}
          disabled={isDownloading}>
          <Text style={styles.downloadButtonText}>
            {isDownloading ? 'Generating…' : 'Download PDF'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  dateRangeSpacing: {
    marginBottom: 20,
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
  tableRow: {
    paddingVertical: 10,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.inputBg,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowModel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 11.5,
    color: colors.textFaint,
    marginTop: 3,
  },
  tableEmptyText: {
    fontSize: 13,
    color: colors.textFaint,
    paddingVertical: 12,
    textAlign: 'center',
  },
  downloadButton: {
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
});
