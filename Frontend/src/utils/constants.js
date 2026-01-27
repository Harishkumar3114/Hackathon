// src/utils/constants.js

export const COUNTRIES = [
  { label: 'India', value: 'IN' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Germany', value: 'DE' },
  { label: 'Global (All)', value: 'ALL' }
];

export const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  value: i
}));