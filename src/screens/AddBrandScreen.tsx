import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { addBrand, brandExists } from '../data/brands';
import BackButton from '../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'AddBrand'>;

export default function AddBrandScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState('');

  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    if (error) {
      setError('');
    }
  };

  const handleAddBrand = () => {
    const trimmed = brandName.trim();
    if (!trimmed) {
      return;
    }

    if (brandExists(trimmed)) {
      setError('This brand is already added');
      return;
    }

    const added = addBrand(trimmed);
    if (!added) {
      setError('This brand is already added');
      return;
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Add Brand</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Enter Brand Name"
            placeholderTextColor={colors.textDisabled}
            value={brandName}
            onChangeText={handleBrandNameChange}
            autoCapitalize="words"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, !brandName.trim() && styles.buttonDisabled]}
          onPress={handleAddBrand}
          disabled={!brandName.trim()}>
          <Text style={styles.buttonText}>Add Brand</Text>
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontFamily: fonts.robotoMedium,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 10,
  },
  input: {
    fontFamily: fonts.robotoRegular,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 14,
    color: colors.danger,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.robotoSemiBold,
    color: colors.white,
    fontSize: 18,
  },
});
