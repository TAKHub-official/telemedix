/**
 * Options related to session management
 */

/**
 * Reasons for completing a session
 * Used when a doctor completes a session in the doctor portal
 */
export const SESSION_COMPLETION_REASONS = [
  { value: 'TREATMENT_COMPLETED', label: 'Behandlung abgeschlossen' },
  { value: 'PATIENT_TRANSFERRED', label: 'Patient weitergeleitet/überstellt' },
  { value: 'PATIENT_DISCHARGED', label: 'Patient entlassen' },
  { value: 'PATIENT_ADMITTED', label: 'Patient stationär aufgenommen' },
  { value: 'PATIENT_REFUSED', label: 'Patient verweigert weitere Behandlung' },
  { value: 'PATIENT_DECEASED', label: 'Patient verstorben' },
  { value: 'PATIENT_IMPROVED', label: 'Besserung des Zustands' },
  { value: 'EMERGENCY_RESOLVED', label: 'Notfall aufgelöst' },
  { value: 'DUPLICATE_SESSION', label: 'Doppelte Session' },
  { value: 'OTHER', label: 'Sonstiger Grund' }
]; 