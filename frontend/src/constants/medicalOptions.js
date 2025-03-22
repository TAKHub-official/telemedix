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
  { value: '<20', label: '<20 bpm (sehr niedrig)', isLow: true },
  { value: '60', label: '60 bpm (Normalwert)', isNormal: true },
  ...Array.from({ length: 34 }, (_, i) => ({ value: String(20 + i * 5), label: `${20 + i * 5} bpm` })),
  { value: '>190', label: '>190 bpm (sehr hoch)', isHigh: true }
];

export const SYSTOLIC_BP_OPTIONS = [
  { value: '<40', label: '<40 mmHg (sehr niedrig)', isLow: true },
  { value: '120', label: '120 mmHg (Normalwert)', isNormal: true },
  ...Array.from({ length: 42 }, (_, i) => ({ value: String(40 + i * 5), label: `${40 + i * 5} mmHg` })),
  { value: '>250', label: '>250 mmHg (sehr hoch)', isHigh: true }
];

export const DIASTOLIC_BP_OPTIONS = [
  { value: '<30', label: '<30 mmHg (sehr niedrig)', isLow: true },
  { value: '80', label: '80 mmHg (Normalwert)', isNormal: true },
  ...Array.from({ length: 24 }, (_, i) => ({ value: String(30 + i * 5), label: `${30 + i * 5} mmHg` })),
  { value: '>150', label: '>150 mmHg (sehr hoch)', isHigh: true }
];

export const OXYGEN_SATURATION_OPTIONS = [
  { value: '98', label: '98% (Normalwert)', isNormal: true },
  ...Array.from({ length: 41 }, (_, i) => ({ value: String(60 + i), label: `${60 + i}%` }))
];

export const RESPIRATORY_RATE_OPTIONS = [
  { value: '0', label: '0 /min (Atemstillstand)', isLow: true },
  { value: '14', label: '14 /min (Normalwert)', isNormal: true },
  ...Array.from({ length: 30 }, (_, i) => ({ value: String(1 + i), label: `${1 + i} /min` })),
  { value: '>30', label: '>30 /min (sehr hoch)', isHigh: true }
];

export const TEMPERATURE_OPTIONS = [
  { value: '36.5', label: '36.5 °C (Normalwert)', isNormal: true },
  ...Array.from({ length: 91 }, (_, i) => ({ value: (34 + i * 0.1).toFixed(1), label: `${(34 + i * 0.1).toFixed(1)} °C` }))
];

export const BLOOD_GLUCOSE_OPTIONS = [
  { value: '100', label: '100 mg/dL (Normalwert)', isNormal: true },
  ...Array.from({ length: 61 }, (_, i) => ({ value: String(40 + i * 10), label: `${40 + i * 10} mg/dL` }))
];

// Generate age options from 1 to 120 years
export const AGE_OPTIONS = Array.from({ length: 120 }, (_, i) => ({ 
  value: String(i + 1), 
  label: `${i + 1} Jahre` 
})); 