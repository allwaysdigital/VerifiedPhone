import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackArrowIcon from '../assets/icons/back_arrow.svg';
import { colors } from '../theme/colors';

export default function BackButton({ onPress }: { onPress?: () => void }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress ?? (() => navigation.goBack())}
      hitSlop={12}
    >
      <BackArrowIcon width={24} height={24} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
