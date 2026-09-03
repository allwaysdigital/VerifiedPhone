import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';

export type ChartSeries = {
  name: string;
  color: string;
  values: number[];
};

type Props = {
  categories: string[];
  series: ChartSeries[];
  yMax: number;
  yStep: number;
};

const CHART_HEIGHT = 200;
const LEFT_AXIS_WIDTH = 60;
const TOP_PADDING = 10;
const BOTTOM_AXIS_HEIGHT = 24;
const BAR_GAP = 3;

export default function BarChart({ categories, series, yMax, yStep }: Props) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const plotWidth = Math.max(width - LEFT_AXIS_WIDTH, 0);
  const groupWidth = categories.length > 0 ? plotWidth / categories.length : 0;
  const barWidth =
    series.length > 0
      ? Math.max((groupWidth - BAR_GAP * (series.length + 1)) / series.length, 2)
      : 0;

  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += yStep) {
    ticks.push(v);
  }

  const yForValue = (v: number) => CHART_HEIGHT - (v / yMax) * CHART_HEIGHT;

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={CHART_HEIGHT + BOTTOM_AXIS_HEIGHT + TOP_PADDING}>
        <G y={TOP_PADDING}>
          {ticks.map(t => {
            const y = yForValue(t);
            return (
              <G key={t}>
                <Line
                  x1={LEFT_AXIS_WIDTH}
                  y1={y}
                  x2={LEFT_AXIS_WIDTH + plotWidth}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={1}
                  strokeDasharray={t === 0 ? undefined : '4,4'}
                />
                <SvgText
                  x={LEFT_AXIS_WIDTH - 8}
                  y={y + 4}
                  fontSize={11}
                  fill={colors.textFaint}
                  textAnchor="end">
                  {t}
                </SvgText>
              </G>
            );
          })}
          <Line
            x1={LEFT_AXIS_WIDTH}
            y1={0}
            x2={LEFT_AXIS_WIDTH}
            y2={CHART_HEIGHT}
            stroke={colors.text}
            strokeWidth={1.5}
          />

          {categories.map((cat, ci) => {
            const groupX = LEFT_AXIS_WIDTH + ci * groupWidth;
            return (
              <G key={cat}>
                {series.map((s, si) => {
                  const val = s.values[ci] ?? 0;
                  const barY = yForValue(val);
                  const barH = Math.max(CHART_HEIGHT - barY, 0);
                  const barX = groupX + BAR_GAP + si * (barWidth + BAR_GAP);
                  return (
                    <Rect
                      key={s.name}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barH}
                      rx={2}
                      fill={s.color}
                    />
                  );
                })}
                <SvgText
                  x={groupX + groupWidth / 2}
                  y={CHART_HEIGHT + 18}
                  fontSize={11}
                  fill={colors.textFaint}
                  textAnchor="middle">
                  {cat}
                </SvgText>
              </G>
            );
          })}
        </G>
        </Svg>
      )}

      <View style={styles.legendRow}>
        {series.map(s => (
          <View key={s.name} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
            <Text allowFontScaling={false} style={styles.legendLabel}>
              {s.name}{' '}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendLabel: {
    flexShrink: 0,
    // Some Android builds under-measure single-line text by a pixel or
    // two, clipping the last glyph when the box is sized exactly to
    // content — extra trailing slack plus a touch of letter-spacing
    // keeps that from ever biting.
    paddingRight: 6,
    letterSpacing: 0.3,
    fontSize: 15,
    color: colors.text,
  },
});
