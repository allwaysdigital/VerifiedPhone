import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanned: (digits: string) => void;
};

// Isolated on purpose: if react-native-camera-kit ever needs to be swapped
// for another scanner library, only this file's internals change.
export default function ImeiScannerModal({ visible, onClose, onScanned }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Camera
        style={styles.camera}
        cameraType={CameraType.Back}
        scanBarcode
        onReadCode={event => {
          const raw = event.nativeEvent.codeStringValue ?? '';
          const digits = raw.replace(/[^\d]/g, '');
          if (digits) {
            onScanned(digits);
          }
        }}
      />
      <Text style={styles.hint}>Point the camera at the IMEI barcode</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Cancel</Text>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  closeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
