import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { useShopData } from '../context/ShopDataContext';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import PlusIcon from '../assets/icons/plus.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Brands'>;

export default function BrandsScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const { brands } = useShopData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Brands</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddBrand')}
          hitSlop={12}>
          <PlusIcon width={24} height={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {brands.length === 0 ? (
          <EmptyState message="No brands found" />
        ) : (
          <View style={styles.card}>
            {brands.map(brand => (
              <View key={brand.id} style={styles.brandRow}>
                <Text style={styles.brandName}>{brand.name}</Text>
              </View>
            ))}
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: fonts.robotoSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  brandRow: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.robotoRegular,
    fontSize: 16,
    color: colors.textMuted,
  },
});
