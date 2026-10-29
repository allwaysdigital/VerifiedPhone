import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

export function AlertTriangleIcon({ size = 24, color = '#f59e0b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5L22 20.5H2L12 3.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Line x1={12} y1={10} x2={12} y2={14.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={17.3} r={1} fill={color} />
    </Svg>
  );
}

export function ShieldCheckIcon({ size = 24, color = '#f59e0b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L4 6V11C4 16 7.5 20 12 21C16.5 20 20 16 20 11V6L12 3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M8.5 12L11 14.5L16 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 20, color = '#10b981' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M8 12.5L10.5 15L16 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HelpIcon({ size = 16, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M9.5 9.5C9.5 8 10.6 7 12 7C13.4 7 14.5 8 14.5 9.3C14.5 10.9 12 11.2 12 13.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={16.3} r={1} fill={color} />
    </Svg>
  );
}

export function ClockIcon({ size = 24, color = '#f59e0b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M12 7V12L15.5 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function XCircleIcon({ size = 24, color = '#ba1a1a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M9 9L15 15M15 9L9 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CopyIcon({ size = 16, color = '#64748b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={9} width={12} height={12} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M5 15V5C5 3.9 5.9 3 7 3H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function DownloadIcon({ size = 16, color = '#d97706' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3V15M12 15L7.5 10.5M12 15L16.5 10.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 17V18C4 19.7 5.3 21 7 21H17C18.7 21 20 19.7 20 18V17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 14, color = '#d97706' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5L16 12L9 19" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function UpiIcon({ size = 20, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 4L10 20L15 8L19 20" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ReceiptCheckIcon({ size = 20, color = '#10b981' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3H18V21L15.5 19.5L13 21L10.5 19.5L8 21L6 19.5V3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M9 10L11 12.5L15.5 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function InfoIcon({ size = 16, color = '#64748b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Line x1={12} y1={11} x2={12} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={8} r={1} fill={color} />
    </Svg>
  );
}

export function SupportHeadsetIcon({ size = 16, color = '#64748b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 13V12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12V13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Rect x={2} y={13} width={5} height={7} rx={2} stroke={color} strokeWidth={2} />
      <Rect x={17} y={13} width={5} height={7} rx={2} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

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
