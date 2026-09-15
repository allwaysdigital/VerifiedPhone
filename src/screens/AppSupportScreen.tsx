import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import { APP_BUILD, APP_VERSION, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP } from '../constants/app';
import BackButton from '../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'AppSupport'>;

const FAQS = [
  {
    question: 'How do I add a new purchase?',
    answer:
      'From the Dashboard, tap "Add Purchase" under Quick Actions, fill in the device and seller details, then sign the declaration to save it to your stock.',
  },
  {
    question: 'How do I record a sale?',
    answer:
      'Tap "Add Sale" on the Dashboard, pick the phone from your current stock, enter the customer\'s details and sale price, then complete the sale. You can generate the invoice later from Sale History.',
  },
  {
    question: 'Why is IMEI no longer required?',
    answer:
      'Some used or imported phones don\'t have an accessible IMEI, so it\'s optional at purchase — you can still search and verify by IMEI whenever it is entered.',
  },
  {
    question: 'Where do I see my profit or loss?',
    answer:
      'The Dashboard\'s "Profit and Loss" card and the Reports tab both show it — tap either to open the full Profit Overview, which lists every sale\'s margin.',
  },
  {
    question: 'How do I change my shop details or logo?',
    answer:
      'Go to Settings → Shop Details, update the fields or upload a new logo, then tap "Save Shop Details".',
  },
];

function CallIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EmailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke={colors.white}
        strokeWidth={2}
      />
      <Path
        d="m22 6-10 7L2 6"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WhatsAppIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84a11.8 11.8 0 0 0 1.62 5.98L0 24l6.34-1.77a11.87 11.87 0 0 0 5.7 1.45h.01c6.54 0 11.85-5.3 11.85-11.84a11.8 11.8 0 0 0-3.38-8.36Z"
        fill={colors.white}
      />
    </Svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <Text style={[styles.faqChevron, open && styles.faqChevronOpen]}>›</Text>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      activeOpacity={0.7}
      onPress={() => setOpen(v => !v)}>
      <View style={styles.faqQuestionRow}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <ChevronIcon open={open} />
      </View>
      {open ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </TouchableOpacity>
  );
}

export default function AppSupportScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);

  const handleCall = () => Linking.openURL(`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`);
  const handleEmail = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('VerifiedPhone Support')}`);
  const handleWhatsApp = () =>
    Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP.replace(/[^\d]/g, '')}`);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>App Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <View style={[styles.contactIconWrap, { backgroundColor: colors.greenDark }]}>
              <CallIcon />
            </View>
            <Text style={styles.contactLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
            <View style={[styles.contactIconWrap, { backgroundColor: colors.green }]}>
              <WhatsAppIcon />
            </View>
            <Text style={styles.contactLabel}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <View style={[styles.contactIconWrap, { backgroundColor: colors.blue }]}>
              <EmailIcon />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactDetailRow}>
            <Text style={styles.contactDetailLabel}>Phone</Text>
            <Text style={styles.contactDetailValue}>{SUPPORT_PHONE}</Text>
          </View>
          <View style={styles.contactDetailRow}>
            <Text style={styles.contactDetailLabel}>Email</Text>
            <Text style={styles.contactDetailValue}>{SUPPORT_EMAIL}</Text>
          </View>
          <Text style={styles.contactHours}>Available Mon–Sat, 10 AM – 7 PM IST</Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {FAQS.map((faq, index) => (
            <React.Fragment key={faq.question}>
              {index > 0 ? <View style={styles.faqDivider} /> : null}
              <FaqItem question={faq.question} answer={faq.answer} />
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.versionText}>
          VerifiedPhone v{APP_VERSION} · Build {APP_BUILD}
        </Text>
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
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: fonts.robotoMedium,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontFamily: fonts.robotoMedium,
    fontSize: 13,
    color: colors.text,
  },
  contactCard: {
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  contactDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactDetailLabel: {
    fontFamily: fonts.robotoRegular,
    fontSize: 13,
    color: colors.textFaint,
  },
  contactDetailValue: {
    fontFamily: fonts.robotoMedium,
    fontSize: 13,
    color: colors.text,
  },
  contactHours: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 4,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  faqItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  faqDivider: {
    height: 1,
    backgroundColor: colors.inputBg,
    marginHorizontal: 16,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: fonts.robotoMedium,
    fontSize: 14.5,
    color: colors.text,
  },
  faqChevron: {
    fontSize: 22,
    color: colors.textFaint,
    transform: [{ rotate: '90deg' }],
  },
  faqChevronOpen: {
    transform: [{ rotate: '270deg' }],
  },
  faqAnswer: {
    fontFamily: fonts.robotoRegular,
    fontSize: 13.5,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 20,
  },
  versionText: {
    fontFamily: fonts.robotoRegular,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 4,
  },
});
