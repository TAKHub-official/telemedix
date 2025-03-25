/**
 * Constants for medical form options including vital signs, gender, and consciousness states
 */

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Männlich' },
  { value: 'FEMALE', label: 'Weiblich' }
];

export const CONSCIOUSNESS_OPTIONS = [
  { value: 'ALERT', label: 'Wach und orientiert' },
  { value: 'VERBAL', label: 'Reaktion auf Ansprache' },
  { value: 'PAIN', label: 'Reaktion auf Schmerzreiz' },
  { value: 'UNRESPONSIVE', label: 'Keine Reaktion' }
];

// Vorgefertigte Werte für Vitalzeichen
export const HEART_RATE_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: '<20', label: '<20 bpm', isLow: true },
  ...Array.from({ length: 34 }, (_, i) => ({ value: String(20 + i * 5), label: `${20 + i * 5} bpm` })),
  { value: '>190', label: '>190 bpm', isHigh: true }
];

export const SYSTOLIC_BP_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: '<40', label: '<40 mmHg', isLow: true },
  ...Array.from({ length: 22 }, (_, i) => ({ value: String(40 + i * 10), label: `${40 + i * 10} mmHg` })),
  { value: '>250', label: '>250 mmHg', isHigh: true }
];

export const DIASTOLIC_BP_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: '<30', label: '<30 mmHg', isLow: true },
  ...Array.from({ length: 13 }, (_, i) => ({ value: String(30 + i * 10), label: `${30 + i * 10} mmHg` })),
  { value: '>150', label: '>150 mmHg', isHigh: true }
];

export const OXYGEN_SATURATION_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: '<60', label: '<60%', isLow: true },
  ...Array.from({ length: 41 }, (_, i) => ({ value: String(60 + i), label: `${60 + i}%` })),
];

export const RESPIRATORY_RATE_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: '0', label: '0 /min', isLow: true },
  ...Array.from({ length: 30 }, (_, i) => ({ value: String(1 + i), label: `${1 + i} /min` })),
  { value: '>30', label: '>30 /min', isHigh: true }
];

export const TEMPERATURE_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: 'kalt', label: 'Kalt', isLow: true },
  { value: '<34.0', label: '<34.0 °C', isLow: true },
  ...Array.from({ length: 61 }, (_, i) => ({ value: (34 + i * 0.1).toFixed(1), label: `${(34 + i * 0.1).toFixed(1)} °C` })),
  { value: '>40.0', label: '>40.0 °C', isHigh: true },
  { value: 'warm', label: 'Warm', isHigh: true }
];

export const BLOOD_GLUCOSE_OPTIONS = [
  { value: '', label: 'Nicht gemessen', isDefault: true },
  { value: '<40', label: '<40 mg/dL', isLow: true },
  ...Array.from({ length: 37 }, (_, i) => ({ value: String(40 + i * 10), label: `${40 + i * 10} mg/dL` })),
  { value: '>400', label: '>400 mg/dL', isHigh: true }
];

// Generate age options from 1 to 120 years
export const AGE_OPTIONS = Array.from({ length: 120 }, (_, i) => ({ 
  value: String(i + 1), 
  label: `${i + 1} Jahre` 
})); 