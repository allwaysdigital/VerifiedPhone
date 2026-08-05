import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

export type SignaturePadHandle = {
  clear: () => void;
  isEmpty: () => boolean;
};

type Props = {
  onChange?: (isEmpty: boolean) => void;
};

export default React.forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { onChange }: Props,
  ref,
) {
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentPoints = useRef<string>('');
  const [currentStroke, setCurrentStroke] = useState('');

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      setStrokes([]);
      setCurrentStroke('');
      currentPoints.current = '';
      onChange?.(true);
    },
    isEmpty: () => strokes.length === 0,
  }));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Capture-phase claims so a parent ScrollView can't steal move events
        // after the initial touch-down on Android.
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: e => {
          const { locationX, locationY } = e.nativeEvent;
          currentPoints.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setCurrentStroke(currentPoints.current);
        },
        onPanResponderMove: e => {
          const { locationX, locationY } = e.nativeEvent;
          currentPoints.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setCurrentStroke(currentPoints.current);
        },
        onPanResponderRelease: () => {
          // Capture the finished path before resetting currentPoints.current —
          // the setStrokes updater below runs later (during React's commit),
          // by which point the ref would already have been cleared to ''.
          const finishedStroke = currentPoints.current;
          if (finishedStroke) {
            setStrokes(prev => [...prev, finishedStroke]);
            currentPoints.current = '';
            setCurrentStroke('');
            onChange?.(false);
          }
        },
      }),
    [onChange],
  );

  return (
    <View style={styles.pad} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {strokes.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={colors.text}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentStroke ? (
          <Path
            d={currentStroke}
            stroke={colors.text}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
  },
});
