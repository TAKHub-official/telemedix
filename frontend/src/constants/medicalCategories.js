/**
 * Medical emergency categories for the session creation form
 * Includes categories from both general and tactical emergency medicine
 */

export const SESSION_CATEGORIES = [
  {
    category: 'Taktische Notfallmedizin',
    subcategories: [
      { value: 'Taktisch - Schussverletzung', label: 'Schussverletzung' },
      { value: 'Taktisch - Stichverletzung', label: 'Stichverletzung' },
      { value: 'Taktisch - Explosionsverletzung', label: 'Explosionsverletzung' },
      { value: 'Taktisch - Massive Blutung', label: 'Massive Blutung' },
      { value: 'Taktisch - MASCAL', label: 'Massenanfall von Verletzten' },
      { value: 'Taktisch - Drohnenverletzung', label: 'Drohnenverletzung' },
      { value: 'Taktisch - Minenverletzung', label: 'Minenverletzung' },
      { value: 'Taktisch - IED-Verletzung', label: 'IED-Verletzung' },
      { value: 'Taktisch - Splitterverletzung', label: 'Splitterverletzung' },
      { value: 'Taktisch - Chemische Verletzung', label: 'Chemische Verletzung' },
      { value: 'Taktisch - Druckverletzung', label: 'Druckverletzung' },
      { value: 'Taktisch - Crush-Syndrom', label: 'Crush-Syndrom' },
      { value: 'Taktisch - Kompartmentsyndrom', label: 'Kompartmentsyndrom' },
      { value: 'Taktisch - Verbrennung', label: 'Verbrennung' },
      { value: 'Taktisch - Prolonged Field Care', label: 'Prolonged Field Care' }
    ]
  },
  { 
    category: 'Traumatologie',
    subcategories: [
      { value: 'Traumatologie - Polytrauma', label: 'Polytrauma' },
      { value: 'Traumatologie - Schädel-Hirn-Trauma', label: 'Schädel-Hirn-Trauma' },
      { value: 'Traumatologie - Wirbelsäulenverletzung', label: 'Wirbelsäulenverletzung' },
      { value: 'Traumatologie - Thoraxtrauma', label: 'Thoraxtrauma' },
      { value: 'Traumatologie - Abdominaltrauma', label: 'Abdominaltrauma' },
      { value: 'Traumatologie - Beckenverletzung', label: 'Beckenverletzung' },
      { value: 'Traumatologie - Extremitätenverletzung', label: 'Extremitätenverletzung' },
      { value: 'Traumatologie - Amputationsverletzung', label: 'Amputationsverletzung' },
      { value: 'Traumatologie - Weichteilverletzung', label: 'Weichteilverletzung' },
      { value: 'Traumatologie - Verbrennung', label: 'Verbrennung' }
    ]
  },
  {
    category: 'Kardiovaskuläre Notfälle',
    subcategories: [
      { value: 'Kardiovaskulär - Herzinfarkt', label: 'Herzinfarkt' },
      { value: 'Kardiovaskulär - Akutes Koronarsyndrom', label: 'Akutes Koronarsyndrom' },
      { value: 'Kardiovaskulär - Herzrhythmusstörung', label: 'Herzrhythmusstörung' },
      { value: 'Kardiovaskulär - Lungenembolie', label: 'Lungenembolie' },
      { value: 'Kardiovaskulär - Hypertensive Krise', label: 'Hypertensive Krise' },
      { value: 'Kardiovaskulär - Aortendissektion', label: 'Aortendissektion' },
      { value: 'Kardiovaskulär - Kardiogener Schock', label: 'Kardiogener Schock' }
    ]
  },
  {
    category: 'Respiratorische Notfälle',
    subcategories: [
      { value: 'Respiratorisch - Akute Atemnot', label: 'Akute Atemnot' },
      { value: 'Respiratorisch - Asthma', label: 'Asthma' },
      { value: 'Respiratorisch - COPD-Exazerbation', label: 'COPD-Exazerbation' },
      { value: 'Respiratorisch - Pneumonie', label: 'Pneumonie' },
      { value: 'Respiratorisch - Pneumothorax', label: 'Pneumothorax' },
      { value: 'Respiratorisch - Atemwegsverlegung', label: 'Atemwegsverlegung' }
    ]
  },
  {
    category: 'Neurologische Notfälle',
    subcategories: [
      { value: 'Neurologisch - Schlaganfall', label: 'Schlaganfall' },
      { value: 'Neurologisch - Krampfanfall', label: 'Krampfanfall' },
      { value: 'Neurologisch - Meningitis', label: 'Meningitis' },
      { value: 'Neurologisch - Bewusstseinsstörung', label: 'Bewusstseinsstörung' },
      { value: 'Neurologisch - Subarachnoidalblutung', label: 'Subarachnoidalblutung' }
    ]
  },
  {
    category: 'Abdominelle Notfälle',
    subcategories: [
      { value: 'Abdominal - Akutes Abdomen', label: 'Akutes Abdomen' },
      { value: 'Abdominal - Appendizitis', label: 'Appendizitis' },
      { value: 'Abdominal - Gastrointestinale Blutung', label: 'Gastrointestinale Blutung' },
      { value: 'Abdominal - Darmverschluss', label: 'Darmverschluss' },
      { value: 'Abdominal - Pankreatitis', label: 'Pankreatitis' }
    ]
  },
  {
    category: 'Metabolische Notfälle',
    subcategories: [
      { value: 'Metabolisch - Hyperglykämie', label: 'Hyperglykämie' },
      { value: 'Metabolisch - Hypoglykämie', label: 'Hypoglykämie' },
      { value: 'Metabolisch - Elektrolytstörung', label: 'Elektrolytstörung' },
      { value: 'Metabolisch - Hypothermie', label: 'Hypothermie' },
      { value: 'Metabolisch - Hyperthermie', label: 'Hyperthermie' }
    ]
  },
  {
    category: 'Sonstige Notfälle',
    subcategories: [
      { value: 'Sonstige - Anaphylaxie', label: 'Anaphylaxie' },
      { value: 'Sonstige - Vergiftung', label: 'Vergiftung' },
      { value: 'Sonstige - Sepsis', label: 'Sepsis' },
      { value: 'Sonstige - Ertrinken', label: 'Ertrinken' },
      { value: 'Sonstige - Geburtshilflicher Notfall', label: 'Geburtshilflicher Notfall' },
      { value: 'Sonstige - Sonstiger Notfall', label: 'Sonstiger Notfall' }
    ]
  }
]; 