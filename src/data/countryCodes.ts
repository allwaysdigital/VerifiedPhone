export type CountryCode = {
  dialCode: string;
  name: string;
  flag: string;
};

export const COUNTRY_CODES: CountryCode[] = [
  { dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { dialCode: '+1', name: 'USA/Canada', flag: '🇺🇸' },
  { dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { dialCode: '+971', name: 'UAE', flag: '🇦🇪' },
  { dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
];

export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0];
