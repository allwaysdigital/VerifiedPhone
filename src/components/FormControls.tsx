import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../theme/colors';
import UploadIcon from '../assets/icons/upload_icon.svg';

export function FormSection({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {headerRight ?? null}
      </View>
      {children}
    </View>
  );
}

type FormInputProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
};

export function FormInput({ label, required, error, style, ...rest }: FormInputProps) {
  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.textDisabled}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type FormSelectProps = {
  label: string;
  required?: boolean;
  error?: string;
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function FormSelect({
  label,
  required,
  error,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.selectInput,
          error ? styles.inputError : null,
          disabled ? styles.selectInputDisabled : null,
        ]}
        disabled={disabled}
        onPress={() => setOpen(true)}>
        <Text style={value ? styles.selectValue : styles.selectPlaceholder}>
          {value ?? placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}>
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export function FormCheckbox({
  label,
  checked,
  onToggle,
  required,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle}>
      <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
        {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
      </View>
      <Text style={styles.checkboxLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
    </TouchableOpacity>
  );
}

export function UploadField({
  label,
  required,
  imageUri,
  onImageSelected,
  error,
  testID,
}: {
  label: string;
  required?: boolean;
  imageUri?: string | null;
  onImageSelected?: (uri: string | null) => void;
  error?: string;
  testID?: string;
}) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const pickFrom = async (source: 'camera' | 'library') => {
    setPickerVisible(false);
    const options = { mediaType: 'photo' as const, quality: 0.8 as const };
    const result =
      source === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

    const uri = result.assets?.[0]?.uri;
    if (uri) {
      onImageSelected?.(uri);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TouchableOpacity
        testID={testID}
        style={[
          styles.uploadBox,
          imageUri ? styles.uploadBoxSelected : null,
          error ? styles.inputError : null,
        ]}
        onPress={() => setPickerVisible(true)}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.uploadPreview} resizeMode="cover" />
        ) : (
          <>
            <UploadIcon width={22} height={22} />
            <Text style={styles.uploadText}>Click to upload</Text>
          </>
        )}
      </TouchableOpacity>
      {imageUri ? (
        <TouchableOpacity onPress={() => onImageSelected?.(null)}>
          <Text style={styles.removeText}>Remove photo</Text>
        </TouchableOpacity>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}>
          <View style={styles.modalSheet}>
            <TouchableOpacity style={styles.modalOption} onPress={() => pickFrom('camera')}>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => pickFrom('library')}>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  required: {
    color: colors.pink,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  selectInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInputDisabled: {
    opacity: 0.6,
  },
  selectValue: {
    fontSize: 15,
    color: colors.text,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: colors.textDisabled,
  },
  chevron: {
    fontSize: 16,
    color: colors.textDisabled,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
    paddingVertical: 8,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBoxSelected: {
    borderStyle: 'solid',
    borderColor: colors.green,
    padding: 0,
    overflow: 'hidden',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  removeText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
  },
});
