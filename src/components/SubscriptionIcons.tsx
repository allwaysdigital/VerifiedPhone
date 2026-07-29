import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

export function CalendarIcon({ size = 20, color = '#303030' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CardIcon({ size = 20, color = '#303030' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={14} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M2 10H22" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function GiftIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={18} height={13} rx={1} stroke={color} strokeWidth={2} />
      <Path d="M12 8V21M3 12H21" stroke={color} strokeWidth={2} />
      <Path
        d="M12 8C12 8 9 8 8 6.5C7.2 5.3 8 4 9.2 4C10.8 4 12 6 12 8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M12 8C12 8 15 8 16 6.5C16.8 5.3 16 4 14.8 4C13.2 4 12 6 12 8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WarningIcon({ size = 40, color = '#ec4d51' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Line x1={12} y1={7} x2={12} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16.5} r={1} fill={color} />
    </Svg>
  );
}

export function StarIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2L14.9 8.6L22 9.3L16.7 14.1L18.2 21.2L12 17.6L5.8 21.2L7.3 14.1L2 9.3L9.1 8.6L12 2Z" />
    </Svg>
  );
}

export function CrownIcon({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3 8L7 11L12 4L17 11L21 8L19 19H5L3 8Z" />
    </Svg>
  );
}

export function PhoneOutlineIcon({ size = 24, color = '#303030' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={7} y={2} width={10} height={20} rx={2} stroke={color} strokeWidth={2} />
      <Line x1={11} y1={18} x2={13} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
