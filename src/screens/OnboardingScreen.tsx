import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { useScreenStatusBar } from '../hooks/useScreenStatusBar';
import Slide2Illustration from '../assets/onboarding/slide2.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type TitlePart = { text: string; highlight?: boolean };

type Slide = {
  key: string;
  titleParts: TitlePart[];
  illustration: 'slide1' | 'slide2' | 'slide3';
  buttonLabel: string;
};

const slides: Slide[] = [
  {
    key: 'legal',
    titleParts: [
      { text: 'Purane Phones Becho, ' },
      { text: 'Legal Tension', highlight: true },
      { text: ' Bilkul Nahi' },
    ],
    illustration: 'slide1',
    buttonLabel: 'Next',
  },
  {
    key: 'invoice',
    titleParts: [
      { text: 'IMEI Online Verify Karo & ' },
      { text: 'Professional Invoice', highlight: true },
      { text: ' Banao' },
    ],
    illustration: 'slide2',
    buttonLabel: 'Next',
  },
  {
    key: 'police',
    titleParts: [
      { text: 'Police Check', highlight: true },
      { text: ' ke Time Ready Raho' },
    ],
    illustration: 'slide3',
    buttonLabel: 'Login',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Illustration({ name }: { name: Slide['illustration'] }) {
  if (name === 'slide1') {
    return (
      <Image
        source={require('../assets/onboarding/slide1.png')}
        style={styles.illustrationImage}
        resizeMode="contain"
      />
    );
  }
  if (name === 'slide3') {
    return (
      <Image
        source={require('../assets/onboarding/slide3.png')}
        style={styles.illustrationImage}
        resizeMode="contain"
      />
    );
  }
  return <Slide2Illustration width="80%" height="100%" />;
}

export default function OnboardingScreen({ navigation }: Props) {
  useScreenStatusBar('dark-content', colors.white);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleButtonPress = () => {
    if (activeIndex < slides.length - 1) {
      goToSlide(activeIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const currentSlide = slides[activeIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.carousel}>
        {slides.map(slide => (
          <View key={slide.key} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Illustration name={slide.illustration} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <Text style={styles.title}>
        {currentSlide.titleParts.map((part, i) => (
          <Text
            key={i}
            style={part.highlight ? styles.titleHighlight : styles.titleDefault}>
            {part.text}
          </Text>
        ))}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>{currentSlide.buttonLabel}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  carousel: {
    flexGrow: 0,
    height: 340,
    marginTop: 40,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: '80%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d9d9d9',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 27,
    fontWeight: '600',
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  titleDefault: {
    color: colors.text,
  },
  titleHighlight: {
    color: colors.primary,
  },
  button: {
    marginTop: 'auto',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
