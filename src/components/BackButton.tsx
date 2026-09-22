import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import BackArrowIcon from '../assets/icons/back_arrow.svg';
import { colors } from '../theme/colors';

export default function BackButton({
  onPress,
  color = colors.text,
}: {
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} hitSlop={12}>
      <BackArrowIcon width={24} height={24} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
