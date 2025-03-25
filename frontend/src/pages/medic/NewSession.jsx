import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  ListSubheader,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { sessionService } from '../../services/sessionService';
import { 
  SESSION_CATEGORIES,
  PRIORITY_OPTIONS,
  GENDER_OPTIONS, 
  CONSCIOUSNESS_OPTIONS,
  HEART_RATE_OPTIONS,
  SYSTOLIC_BP_OPTIONS,
  DIASTOLIC_BP_OPTIONS,
  OXYGEN_SATURATION_OPTIONS,
  RESPIRATORY_RATE_OPTIONS,
  TEMPERATURE_OPTIONS,
  BLOOD_GLUCOSE_OPTIONS,
  AGE_OPTIONS
} from '../../constants';

const NewSession = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedSessionId, setGeneratedSessionId] = useState('');
  const [showPastMedicalHistory, setShowPastMedicalHistory] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);
  const [medicationText, setMedicationText] = useState(''); // New state for medications
  
  // Generate a unique session ID on component mount
  useEffect(() => {
    generateSessionId();
  }, []);
  
  // Generate a unique session ID with format S[YY][MM][DD][###]
  const generateSessionId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (1-12) padded to 2 digits
    const day = now.getDate().toString().padStart(2, '0'); // Day padded to 2 digits
    
    // Generate a random 3-digit number for the sequence
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const sessionId = `S${year}${month}${day}${sequence}`;
    setGeneratedSessionId(sessionId);
    
    // Update form data with the generated ID
    setFormData(prev => ({
      ...prev,
      patientCode: sessionId
    }));
  };
  
  // Form state
  const [formData, setFormData] = useState({
    // Session data
    title: '',
    sessionCategory: '',
    patientCode: '',
    priority: 'NORMAL',
    
    // Patient data
    patientAge: '45', // Default age is now 45
    patientGender: 'MALE',
    accidentTimeHour: '', // New field for accident time hour
    accidentTimeMinute: '', // New field for accident time minute
    
    // Vital signs - setze Standardwerte
    heartRate: '',  // Standardwert: Nicht gemessen
    systolicBP: '',  // Standardwert: Nicht gemessen
    diastolicBP: '',  // Standardwert: Nicht gemessen
    oxygenSaturation: '',  // Standardwert: Nicht gemessen
    respiratoryRate: '',  // Standardwert: Nicht gemessen
    temperature: '',  // Optional - Standardwert: Nicht gemessen
    bloodGlucose: '',  // Optional - Standardwert: Nicht gemessen
    painLevel: '0',
    consciousness: 'ALERT',
    
    // Incident details
    injuryProcess: '', // renamed from chiefComplaint
    injuries: '', // new field for injuries
    incidentDescription: '',
    pastMedicalHistory: '',
    allergies: '',
    medications: '',
    
    // Treatment so far
    treatmentSoFar: '', // free text field for additional treatment info
    
    // Treatment options
    accessPvk: false, // Zugang: PVK
    accessIo: false,  // Zugang: IO
    accessZvk: false, // Zugang: ZVK
    accessArterial: false, // Zugang: Arteriell
    
    perfusors: '',     // Perfusoren (text field)
    reanimation: '',   // Reanimation (text field)
    
    intubationSga: false,      // Intubation: SGA
    intubationTubus: false,    // Intubation: Endotr. Tubus
    intubationKoniotomie: false, // Intubation: Koniotomie
    
    ventilationManual: false,  // Beatmung: manuell
    ventilationMechanical: false, // Beatmung: maschinell
    
    thoraxDrainageRight: false, // Thorax Drainage: rechts
    thoraxDrainageLeft: false,  // Thorax Drainage: links
    
    decompressionRight: false, // Dekompression: rechts
    decompressionLeft: false,  // Dekompression: links
    
    extendedNarcosis: false,   // Erweiterte Maßnahmen: Narkose
    extendedStiffneck: false,  // Erweiterte Maßnahmen: Stiffneck
    extendedVacuumMattress: false, // Erweiterte Maßnahmen: Vakuum-Matratze
    extendedGastricTube: false,    // Erweiterte Maßnahmen: Magensonde
    extendedUrinaryCatheter: false, // Erweiterte Maßnahmen: Urinkatheter
    
    hemostasisTq: false,       // Blutstillung: TQ
    hemostasisDv: false,       // Blutstillung: Israeli
    hemostasisWp: false,       // Blutstillung: WP
    perfusorCount: '1',
    ventilationPeep: '',
    ventilationFio2: '',
    ventilationTidalVolume: '',
    ventilationRespiratoryRate: '',
    ventilationInspiratoryTime: '',
    ventilationMode: '',
  });
  
  // Steps for the form
  const steps = [
    'Patienten-Daten',
    'Verletzungshergang',
    'Vitalwerte',
    'Behandlung bisher',
    'Übersicht'
  ];
  
  // Helper function to handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle next step
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Format the accident time if both hour and minute are provided
      const accidentTime = formData.accidentTimeHour && formData.accidentTimeMinute 
        ? `${String(formData.accidentTimeHour).padStart(2, '0')}:${String(formData.accidentTimeMinute).padStart(2, '0')} Uhr` 
        : '';
      
      // Prepare data for API request
      const sessionData = {
        title: formData.sessionCategory || `Patient ${formData.patientCode}`,
        patientCode: formData.patientCode,
        priority: formData.priority,
        medicalRecord: {
          patientHistory: JSON.stringify({
            personalInfo: {
              fullName: formData.sessionCategory || `Patient ${formData.patientCode}`,
              age: formData.patientAge,
              gender: formData.patientGender === 'MALE' ? 'Männlich' : 'Weiblich'
            },
            gender: formData.patientGender === 'MALE' ? 'Männlich' : 'Weiblich',
            accidentTime: accidentTime,
            injuryProcess: formData.injuryProcess,
            injuries: formData.injuries,
            incidentDescription: formData.incidentDescription,
            pastMedicalHistory: showPastMedicalHistory ? formData.pastMedicalHistory : '',
            treatmentSoFar: formData.treatmentSoFar,
            treatment: {
              // Add detailed treatment fields here
              breathing: formData.ventilationManual ? 'Manuell' : formData.ventilationMechanical ? 'Maschinell' : 'Spontan',
              // Bei Zugang alle gewählten Optionen anzeigen, kommagetrennt
              access: [
                formData.accessPvk ? 'PVK' : null,
                formData.accessIo ? 'IO' : null,
                formData.accessZvk ? 'ZVK' : null,
                formData.accessArterial ? 'Arteriell' : null
              ].filter(Boolean).join(', ') || 'Kein Zugang',
              intubation: formData.intubationSga ? 'SGA' : formData.intubationTubus ? 'Endotr. Tubus' : formData.intubationKoniotomie ? 'Koniotomie' : 'Keine',
              // Bei Blutstillung alle gewählten Optionen anzeigen, kommagetrennt
              hemostasis: [
                formData.hemostasisTq ? 'TQ' : null,
                formData.hemostasisDv ? 'Israeli' : null,
                formData.hemostasisWp ? 'WP' : null
              ].filter(Boolean).join(', ') || 'Keine',
              perfusors: formData.perfusors || 'Keine',
              medicationText: medicationText || 'Keine',
              extendedMeasures: (
                (formData.extendedNarcosis ? 'Narkose, ' : '') +
                (formData.extendedStiffneck ? 'Stiffneck, ' : '') +
                (formData.extendedVacuumMattress ? 'Vakuum-Matratze, ' : '') +
                (formData.extendedGastricTube ? 'Magensonde, ' : '') +
                (formData.extendedUrinaryCatheter ? 'Urinkatheter, ' : '')
              ).replace(/,\s*$/, '') || 'Keine',
              reanimation: formData.reanimation || 'Keine',
              thoraxDrainage: (formData.thoraxDrainageRight ? 'Rechts, ' : '') + (formData.thoraxDrainageLeft ? 'Links' : '').replace(/,\s*$/, '') || 'Keine',
              decompression: (formData.decompressionRight ? 'Rechts, ' : '') + (formData.decompressionLeft ? 'Links' : '').replace(/,\s*$/, '') || 'Keine'
            }
          }),
          allergies: showAllergies ? formData.allergies : '',
          currentMedications: formData.medications
        }
      };
      
      // Create session
      const response = await sessionService.createSession(sessionData);
      
      // If successful, add vital signs
      if (response.session && response.session.id) {
        const sessionId = response.session.id;
        
        // Add vital signs one by one
        await sessionService.addVitalSign(sessionId, {
          type: 'HEART_RATE',
          value: formData.heartRate || '',
          unit: 'bpm'
        });
        
        await sessionService.addVitalSign(sessionId, {
          type: 'BLOOD_PRESSURE',
          value: formData.systolicBP && formData.diastolicBP ? `${formData.systolicBP}/${formData.diastolicBP}` : '',
          unit: 'mmHg'
        });
        
        await sessionService.addVitalSign(sessionId, {
          type: 'OXYGEN_SATURATION',
          value: formData.oxygenSaturation || '',
          unit: '%'
        });
        
        await sessionService.addVitalSign(sessionId, {
          type: 'RESPIRATORY_RATE',
          value: formData.respiratoryRate || '',
          unit: 'breaths/min'
        });
        
        // Nur senden, wenn Temperatur hinzugefügt und ausgewählt wurde
        if (formData.temperature) {
          await sessionService.addVitalSign(sessionId, {
            type: 'TEMPERATURE',
            value: formData.temperature || '',
            unit: '°C'
          });
        }
        
        // Nur senden, wenn Blutzucker hinzugefügt und ausgewählt wurde
        if (formData.bloodGlucose) {
          await sessionService.addVitalSign(sessionId, {
            type: 'BLOOD_GLUCOSE',
            value: formData.bloodGlucose || '',
            unit: 'mg/dL'
          });
        }
        
        if (formData.painLevel) {
          await sessionService.addVitalSign(sessionId, {
            type: 'PAIN_LEVEL',
            value: formData.painLevel,
            unit: '/10'
          });
        }
        
        await sessionService.addVitalSign(sessionId, {
          type: 'CONSCIOUSNESS',
          value: formData.consciousness,
          unit: 'AVPU'
        });
        
        // Add treatment info
        // Build treatment description string from the selected options
        let treatmentDescription = '';
        
        // Access
        if (formData.accessPvk || formData.accessIo || formData.accessZvk || formData.accessArterial) {
          treatmentDescription += 'Zugang: ';
          const accessTypes = [];
          if (formData.accessPvk) accessTypes.push('PVK');
          if (formData.accessIo) accessTypes.push('IO');
          if (formData.accessZvk) accessTypes.push('ZVK');
          if (formData.accessArterial) accessTypes.push('Arteriell');
          treatmentDescription += accessTypes.join(', ') + '. ';
        } else {
          treatmentDescription += 'Zugang: Kein. ';
        }
        
        // Perfusoren
        if (formData.perfusors) {
          treatmentDescription += `Perfusoren: ${formData.perfusors}. `;
        }
        else {
          treatmentDescription += 'Perfusoren: Keine. ';
        }
        
        // Laufende Medikation
        if (medicationText) {
          treatmentDescription += `Laufende Medikation: ${medicationText}. `;
        }
        else {
          treatmentDescription += 'Laufende Medikation: Keine. ';
        }
        
        // Reanimation
        if (formData.reanimation) {
          treatmentDescription += `Reanimation: ${formData.reanimation}. `;
        }
        else {
          treatmentDescription += 'Reanimation: Keine. ';
        }
        
        // Intubation
        if (formData.intubationSga || formData.intubationTubus || formData.intubationKoniotomie) {
          treatmentDescription += 'Intubation: ';
          if (formData.intubationSga) treatmentDescription += 'SGA. ';
          if (formData.intubationTubus) treatmentDescription += 'Endotr. Tubus. ';
          if (formData.intubationKoniotomie) treatmentDescription += 'Koniotomie. ';
        } else {
          treatmentDescription += 'Intubation: Keine. ';
        }
        
        // Beatmung
        if (formData.ventilationManual || formData.ventilationMechanical) {
          treatmentDescription += 'Beatmung: ';
          if (formData.ventilationManual) treatmentDescription += 'Manuell. ';
          if (formData.ventilationMechanical) treatmentDescription += 'Maschinell. ';
        }
        else {
          treatmentDescription += 'Beatmung: Keine. ';
        }
        
        // Thorax Drainage
        if (formData.thoraxDrainageRight || formData.thoraxDrainageLeft) {
          treatmentDescription += 'Thorax Drainage: ';
          if (formData.thoraxDrainageRight) treatmentDescription += 'Rechts, ';
          if (formData.thoraxDrainageLeft) treatmentDescription += 'Links, ';
          treatmentDescription = treatmentDescription.replace(/,\s*$/, '. '); // Replace trailing comma with period
        }
        else {
          treatmentDescription += 'Thorax Drainage: Keine. ';
        }
        
        // Dekompression
        if (formData.decompressionRight || formData.decompressionLeft) {
          treatmentDescription += 'Dekompression: ';
          if (formData.decompressionRight) treatmentDescription += 'Rechts, ';
          if (formData.decompressionLeft) treatmentDescription += 'Links, ';
          treatmentDescription = treatmentDescription.replace(/,\s*$/, '. '); // Replace trailing comma with period
        }
        else {
          treatmentDescription += 'Dekompression: Keine. ';
        }
        
        // Erweiterte Maßnahmen
        if (formData.extendedNarcosis || formData.extendedStiffneck || 
            formData.extendedVacuumMattress || formData.extendedGastricTube ||
            formData.extendedUrinaryCatheter) {
          treatmentDescription += 'Erweiterte Maßnahmen: ';
          if (formData.extendedNarcosis) treatmentDescription += 'Narkose, ';
          if (formData.extendedStiffneck) treatmentDescription += 'Stiffneck, ';
          if (formData.extendedVacuumMattress) treatmentDescription += 'Vakuum-Matratze, ';
          if (formData.extendedGastricTube) treatmentDescription += 'Magensonde, ';
          if (formData.extendedUrinaryCatheter) treatmentDescription += 'Urinkatheter, ';
          treatmentDescription = treatmentDescription.replace(/,\s*$/, '. '); // Replace trailing comma with period
        }
        else {
          treatmentDescription += 'Erweiterte Maßnahmen: Keine. ';
        }
        
        // Blutstillung
        if (formData.hemostasisTq || formData.hemostasisDv || formData.hemostasisWp) {
          treatmentDescription += 'Blutstillung: ';
          const hemostasisTypes = [];
          if (formData.hemostasisTq) hemostasisTypes.push('TQ');
          if (formData.hemostasisDv) hemostasisTypes.push('Israeli');
          if (formData.hemostasisWp) hemostasisTypes.push('WP');
          treatmentDescription += hemostasisTypes.join(', ') + '. ';
        }
        else {
          treatmentDescription += 'Blutstillung: Keine. ';
        }
        
        // Add any additional free text
        if (formData.treatmentSoFar) {
          treatmentDescription += `${formData.treatmentSoFar}`;
        }
        
        // Add treatment note if there's any treatment description
        if (treatmentDescription) {
          await sessionService.addNote(sessionId, {
            title: 'Bisherige Behandlung',
            content: treatmentDescription,
            type: 'TREATMENT'
          });
        }
        
        setSuccess(true);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/medic/sessions');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Fehler beim Erstellen der Session. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to cancel and go back
  const handleCancel = () => {
    navigate('/medic/dashboard');
  };
  
  // Render different form steps
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box component="form" sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Patienten-Daten
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="category-label">Kategorie des Notfalls *</InputLabel>
                  <Select
                    labelId="category-label"
                    name="sessionCategory"
                    value={formData.sessionCategory}
                    onChange={handleChange}
                    label="Kategorie des Notfalls *"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 500,
                        },
                      },
                    }}
                  >
                    {SESSION_CATEGORIES.map(category => [
                      <ListSubheader 
                        key={`header-${category.category}`}
                        sx={{
                          backgroundColor: '#f5f5f5', 
                          color: 'primary.main',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          lineHeight: '2.5rem',
                          borderTop: category.category !== SESSION_CATEGORIES[0].category ? '1px solid #e0e0e0' : 'none',
                          borderBottom: '1px solid #e0e0e0',
                          marginTop: category.category !== SESSION_CATEGORIES[0].category ? '8px' : '0px',
                        }}
                      >
                        {category.category}
                      </ListSubheader>,
                      ...category.subcategories.map(subcat => (
                        <MenuItem 
                          key={subcat.value} 
                          value={subcat.value}
                          sx={{
                            pl: 4, // Extra padding to show hierarchy
                            borderBottom: '1px dotted #f0f0f0',
                          }}
                        >
                          {subcat.label}
                        </MenuItem>
                      ))
                    ]).flat()}
                  </Select>
                  <FormHelperText>Wählen Sie eine Kategorie aus</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session-ID"
                  name="patientCode"
                  value={formData.patientCode}
                  disabled={true} // Disable manual entry
                  margin="normal"
                  helperText="Automatisch generierte Session-ID"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="priority-label">Priorität</InputLabel>
                  <Select
                    labelId="priority-label"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Priorität"
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="patientAge-label">Alter des Patienten</InputLabel>
                  <Select
                    labelId="patientAge-label"
                    name="patientAge"
                    value={formData.patientAge}
                    onChange={handleChange}
                    label="Alter des Patienten"
                  >
                    {AGE_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="patientGender-label">Geschlecht</InputLabel>
                  <Select
                    labelId="patientGender-label"
                    name="patientGender"
                    value={formData.patientGender}
                    onChange={handleChange}
                    label="Geschlecht"
                  >
                    {GENDER_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  <FormControl sx={{ width: 80, mr: 1 }} size="small">
                    <InputLabel id="accident-hour-label">Std</InputLabel>
                    <Select
                      labelId="accident-hour-label"
                      name="accidentTimeHour"
                      value={formData.accidentTimeHour}
                      onChange={handleChange}
                      label="Std"
                    >
                      {Array.from({ length: 25 }, (_, i) => (
                        <MenuItem key={i} value={String(i)}>
                          {String(i).padStart(2, '0')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ width: 80 }} size="small">
                    <InputLabel id="accident-minute-label">Min</InputLabel>
                    <Select
                      labelId="accident-minute-label"
                      name="accidentTimeMinute"
                      value={formData.accidentTimeMinute}
                      onChange={handleChange}
                      label="Min"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <MenuItem key={i} value={String(i)}>
                          {String(i).padStart(2, '0')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, alignSelf: 'center' }}>
                    Unfallzeit
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
              >
                Abbrechen
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!formData.sessionCategory} // Only session category is required now
              >
                Weiter
              </Button>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box component="form" sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Verletzungshergang
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Verletzungshergang"
                  name="injuryProcess"
                  value={formData.injuryProcess}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={4}
                  placeholder="Detaillierte Beschreibung des Verletzungshergangs..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Verletzungen:
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mb: 2, 
                  maxWidth: '100%',
                  overflow: 'auto'
                }}>
                  {/* Verletzungstypen */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Wunde` : 'Wunde'
                      }));
                    }}
                  >
                    Wunde
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Amputation` : 'Amputation'
                      }));
                    }}
                  >
                    Amputation
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Verbrennung` : 'Verbrennung'
                      }));
                    }}
                  >
                    Verbrennung
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Fraktur` : 'Fraktur'
                      }));
                    }}
                  >
                    Fraktur
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Pneu` : 'Pneu'
                      }));
                    }}
                  >
                    Pneu
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} SHT` : 'SHT'
                      }));
                    }}
                  >
                    SHT
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Kritische Blutung` : 'Kritische Blutung'
                      }));
                    }}
                  >
                    Kritische Blutung
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Stumpfes` : 'Stumpfes'
                      }));
                    }}
                  >
                    Stumpfes
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Zentralisation` : 'Zentralisation'
                      }));
                    }}
                  >
                    Zentralisation
                  </Button>
                  
                  {/* Körperteile */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Kopf` : 'Kopf'
                      }));
                    }}
                  >
                    Kopf
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Gesicht` : 'Gesicht'
                      }));
                    }}
                  >
                    Gesicht
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Hals` : 'Hals'
                      }));
                    }}
                  >
                    Hals
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Brust` : 'Brust'
                      }));
                    }}
                  >
                    Brust
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Abdomen` : 'Abdomen'
                      }));
                    }}
                  >
                    Abdomen
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Wirbelsäule` : 'Wirbelsäule'
                      }));
                    }}
                  >
                    Wirbelsäule
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Rücken` : 'Rücken'
                      }));
                    }}
                  >
                    Rücken
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Becken` : 'Becken'
                      }));
                    }}
                  >
                    Becken
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Arm` : 'Arm'
                      }));
                    }}
                  >
                    Arm
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Hand` : 'Hand'
                      }));
                    }}
                  >
                    Hand
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Bein` : 'Bein'
                      }));
                    }}
                  >
                    Bein
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} Fuß` : 'Fuß'
                      }));
                    }}
                  >
                    Fuß
                  </Button>
                  
                  {/* Zusätzliche Beschreibungen */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} rechts` : 'rechts'
                      }));
                    }}
                  >
                    rechts
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} links` : 'links'
                      }));
                    }}
                  >
                    links
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} mit` : 'mit'
                      }));
                    }}
                  >
                    mit
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries} und` : 'und'
                      }));
                    }}
                  >
                    und
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        injuries: prev.injuries ? `${prev.injuries},` : ','
                      }));
                    }}
                  >
                    ,
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  label="Verletzungen"
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Beschreibung der Verletzungen..."
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {!showPastMedicalHistory ? (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => setShowPastMedicalHistory(true)}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Vorerkrankungen hinzufügen
                  </Button>
                ) : (
                  <TextField
                    fullWidth
                    label="Relevante Vorerkrankungen"
                    name="pastMedicalHistory"
                    value={formData.pastMedicalHistory}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={2}
                    placeholder="z.B. Diabetes, Bluthochdruck, frühere Herzinfarkte..."
                  />
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {!showAllergies ? (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => setShowAllergies(true)}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Allergien hinzufügen
                  </Button>
                ) : (
                  <TextField
                    fullWidth
                    label="Allergien"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="z.B. Penicillin, Nüsse, Latex..."
                  />
                )}
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Zurück
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Weiter
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box component="form" sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Vitalwerte
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="heart-rate-label">Herzfrequenz (bpm)</InputLabel>
                  <Select
                    labelId="heart-rate-label"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                    label="Herzfrequenz (bpm)"
                  >
                    {HEART_RATE_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="systolic-bp-label">Blutdruck - Systolisch</InputLabel>
                  <Select
                    labelId="systolic-bp-label"
                    name="systolicBP"
                    value={formData.systolicBP}
                    onChange={handleChange}
                    label="Blutdruck - Systolisch"
                  >
                    {SYSTOLIC_BP_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="diastolic-bp-label">Blutdruck - Diastolisch</InputLabel>
                  <Select
                    labelId="diastolic-bp-label"
                    name="diastolicBP"
                    value={formData.diastolicBP}
                    onChange={handleChange}
                    label="Blutdruck - Diastolisch"
                  >
                    {DIASTOLIC_BP_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="oxygen-saturation-label">Sauerstoffsättigung (%)</InputLabel>
                  <Select
                    labelId="oxygen-saturation-label"
                    name="oxygenSaturation"
                    value={formData.oxygenSaturation}
                    onChange={handleChange}
                    label="Sauerstoffsättigung (%)"
                  >
                    {OXYGEN_SATURATION_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="respiratory-rate-label">Atemfrequenz (pro Minute)</InputLabel>
                  <Select
                    labelId="respiratory-rate-label"
                    name="respiratoryRate"
                    value={formData.respiratoryRate}
                    onChange={handleChange}
                    label="Atemfrequenz (pro Minute)"
                  >
                    {RESPIRATORY_RATE_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="temperature-label">Temperatur (°C)</InputLabel>
                  <Select
                    labelId="temperature-label"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    label="Temperatur (°C)"
                  >
                    {TEMPERATURE_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="blood-glucose-label">Blutzucker (mg/dL)</InputLabel>
                  <Select
                    labelId="blood-glucose-label"
                    name="bloodGlucose"
                    value={formData.bloodGlucose}
                    onChange={handleChange}
                    label="Blutzucker (mg/dL)"
                  >
                    {BLOOD_GLUCOSE_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="pain-level-label">Schmerzniveau (0-10)</InputLabel>
                  <Select
                    labelId="pain-level-label"
                    name="painLevel"
                    value={formData.painLevel}
                    onChange={handleChange}
                    label="Schmerzniveau (0-10)"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <MenuItem key={i} value={String(i)}>
                        {i} - {i === 0 ? 'Keine Schmerzen' : i === 10 ? 'Stärkste Schmerzen' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="consciousness-label">Bewusstseinszustand</InputLabel>
                  <Select
                    labelId="consciousness-label"
                    name="consciousness"
                    value={formData.consciousness}
                    onChange={handleChange}
                    label="Bewusstseinszustand"
                  >
                    {CONSCIOUSNESS_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Zurück
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Weiter
              </Button>
            </Box>
          </Box>
        );
        
      case 3:
        return (
          <Box component="form" sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Behandlung bisher
            </Typography>
            
            <Grid container spacing={3}>
              {/* Zugang */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Zugang:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.accessPvk ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        accessPvk: !prev.accessPvk
                      }));
                    }}
                  >
                    PVK
                  </Button>
                  <Button 
                    variant={formData.accessIo ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        accessIo: !prev.accessIo
                      }));
                    }}
                  >
                    IO
                  </Button>
                  <Button 
                    variant={formData.accessZvk ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        accessZvk: !prev.accessZvk
                      }));
                    }}
                  >
                    ZVK
                  </Button>
                  <Button 
                    variant={formData.accessArterial ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        accessArterial: !prev.accessArterial
                      }));
                    }}
                  >
                    Arteriell
                  </Button>
                </Box>
              </Grid>
              
              {/* Perfusoren */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Perfusoren:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ width: 100 }}>
                    <InputLabel id="perfusor-count-label">Anzahl</InputLabel>
                    <Select
                      labelId="perfusor-count-label"
                      label="Anzahl"
                      value={formData.perfusorCount || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          perfusorCount: e.target.value
                        }));
                      }}
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    name="perfusors"
                    value={formData.perfusors}
                    onChange={handleChange}
                    placeholder="Laufende Medikation auf Perfusoren..."
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Grid>
              
              {/* Laufende/vergangene Medikation */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Laufende/vergangene Medikation:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mb: 1, 
                  maxWidth: '100%',
                  overflow: 'auto'
                }}>
                  {/* Medikamente */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Ketamin` : 'Ketamin');
                    }}
                  >
                    Ketamin
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Midazolam` : 'Midazolam');
                    }}
                  >
                    Midazolam
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Paracetamol` : 'Paracetamol');
                    }}
                  >
                    Paracetamol
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Fentanyl` : 'Fentanyl');
                    }}
                  >
                    Fentanyl
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Novamin` : 'Novamin');
                    }}
                  >
                    Novamin
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Lidocain` : 'Lidocain');
                    }}
                  >
                    Lidocain
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Breitbandantibiotika` : 'Breitbandantibiotika');
                    }}
                  >
                    Breitbandantibiotika
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Tranexamsäure` : 'Tranexamsäure');
                    }}
                  >
                    Tranexamsäure
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Epinephrin` : 'Epinephrin');
                    }}
                  >
                    Epinephrin
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} NaCl` : 'NaCl');
                    }}
                  >
                    NaCl
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} Jono/Stero` : 'Jono/Stero');
                    }}
                  >
                    Jono/Stero
                  </Button>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mb: 1, 
                  maxWidth: '100%',
                  overflow: 'auto'
                }}>
                  {/* Einheiten und Mengen */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f5f5f5' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} mg` : 'mg');
                    }}
                  >
                    mg
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f5f5f5' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} mcg` : 'mcg');
                    }}
                  >
                    mcg
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f5f5f5' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} ml` : 'ml');
                    }}
                  >
                    ml
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f5f5f5' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} in` : 'in');
                    }}
                  >
                    in
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f0f0f0' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} 1` : '1');
                    }}
                  >
                    1
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f0f0f0' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} 5` : '5');
                    }}
                  >
                    5
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f0f0f0' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} 10` : '10');
                    }}
                  >
                    10
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f0f0f0' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} 20` : '20');
                    }}
                  >
                    20
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f0f0f0' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} 100` : '100');
                    }}
                  >
                    100
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ backgroundColor: '#f0f0f0' }}
                    onClick={() => {
                      setMedicationText(prev => prev ? `${prev} 500` : '500');
                    }}
                  >
                    500
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  name="medications"
                  value={medicationText}
                  onChange={(e) => setMedicationText(e.target.value)}
                  placeholder="Medikation..."
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              {/* Reanimation */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Reanimation:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  name="reanimation"
                  value={formData.reanimation}
                  onChange={handleChange}
                  placeholder="Reanimation..."
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              {/* Intubation */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Intubation:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.intubationSga ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        intubationSga: !prev.intubationSga,
                        intubationTubus: false,
                        intubationKoniotomie: false
                      }));
                    }}
                  >
                    SGA
                  </Button>
                  <Button 
                    variant={formData.intubationTubus ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        intubationSga: false,
                        intubationTubus: !prev.intubationTubus,
                        intubationKoniotomie: false
                      }));
                    }}
                  >
                    Endotr. Tubus
                  </Button>
                  <Button 
                    variant={formData.intubationKoniotomie ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        intubationSga: false,
                        intubationTubus: false,
                        intubationKoniotomie: !prev.intubationKoniotomie
                      }));
                    }}
                  >
                    Koniotomie
                  </Button>
                </Box>
              </Grid>
              
              {/* Beatmung */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Atmung / Beatmung:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.ventilationManual ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        ventilationManual: !prev.ventilationManual,
                        ventilationMechanical: false
                      }));
                    }}
                  >
                    manuell
                  </Button>
                  <Button 
                    variant={formData.ventilationMechanical ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        ventilationManual: false,
                        ventilationMechanical: !prev.ventilationMechanical
                      }));
                    }}
                  >
                    maschinell
                  </Button>
                </Box>

                {/* Maschinelle Beatmungseinstellungen */}
                {formData.ventilationMechanical && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id="peep-label">PEEP (mbar)</InputLabel>
                      <Select
                        labelId="peep-label"
                        label="PEEP (mbar)"
                        value={formData.ventilationPeep || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            ventilationPeep: e.target.value
                          }));
                        }}
                      >
                        {[0, 2, 4, 5, 6, 8, 10, 12, 15, 20].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id="fio2-label">FiO₂ (%)</InputLabel>
                      <Select
                        labelId="fio2-label"
                        label="FiO₂ (%)"
                        value={formData.ventilationFio2 || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            ventilationFio2: e.target.value
                          }));
                        }}
                      >
                        {[21, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id="tidal-volume-label">Tidalvolumen (ml)</InputLabel>
                      <Select
                        labelId="tidal-volume-label"
                        label="Tidalvolumen (ml)"
                        value={formData.ventilationTidalVolume || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            ventilationTidalVolume: e.target.value
                          }));
                        }}
                      >
                        {[300, 400, 500, 600, 700, 800, 900, 1000].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id="respiratory-rate-label">Atemfrequenz (/min)</InputLabel>
                      <Select
                        labelId="respiratory-rate-label"
                        label="Atemfrequenz (/min)"
                        value={formData.ventilationRespiratoryRate || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            ventilationRespiratoryRate: e.target.value
                          }));
                        }}
                      >
                        {[8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id="inspiratory-time-label">Inspirationszeit (s)</InputLabel>
                      <Select
                        labelId="inspiratory-time-label"
                        label="Inspirationszeit (s)"
                        value={formData.ventilationInspiratoryTime || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            ventilationInspiratoryTime: e.target.value
                          }));
                        }}
                      >
                        {[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ width: 120 }}>
                      <InputLabel id="ventilation-mode-label">Beatmungsmodus</InputLabel>
                      <Select
                        labelId="ventilation-mode-label"
                        label="Beatmungsmodus"
                        value={formData.ventilationMode || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            ventilationMode: e.target.value
                          }));
                        }}
                      >
                        <MenuItem value="PCV">PCV</MenuItem>
                        <MenuItem value="VCV">VCV</MenuItem>
                        <MenuItem value="BiPAP">BiPAP</MenuItem>
                        <MenuItem value="APRV">APRV</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Grid>
              
              {/* Thorax Drainage */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Thorax Drainage:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.thoraxDrainageRight ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        thoraxDrainageRight: !prev.thoraxDrainageRight
                      }));
                    }}
                  >
                    rechts
                  </Button>
                  <Button 
                    variant={formData.thoraxDrainageLeft ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        thoraxDrainageLeft: !prev.thoraxDrainageLeft
                      }));
                    }}
                  >
                    links
                  </Button>
                </Box>
              </Grid>
              
              {/* Dekompression */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Dekompression:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.decompressionRight ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        decompressionRight: !prev.decompressionRight
                      }));
                    }}
                  >
                    rechts
                  </Button>
                  <Button 
                    variant={formData.decompressionLeft ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        decompressionLeft: !prev.decompressionLeft
                      }));
                    }}
                  >
                    links
                  </Button>
                </Box>
              </Grid>
              
              {/* Erweiterte Maßnahmen */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Erweiterte Maßnahmen:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.extendedNarcosis ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        extendedNarcosis: !prev.extendedNarcosis
                      }));
                    }}
                  >
                    Narkose
                  </Button>
                  <Button 
                    variant={formData.extendedStiffneck ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        extendedStiffneck: !prev.extendedStiffneck
                      }));
                    }}
                  >
                    Stiffneck
                  </Button>
                  <Button 
                    variant={formData.extendedVacuumMattress ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        extendedVacuumMattress: !prev.extendedVacuumMattress
                      }));
                    }}
                  >
                    Vakuum-Matratze
                  </Button>
                  <Button 
                    variant={formData.extendedGastricTube ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        extendedGastricTube: !prev.extendedGastricTube
                      }));
                    }}
                  >
                    Magensonde
                  </Button>
                  <Button 
                    variant={formData.extendedUrinaryCatheter ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        extendedUrinaryCatheter: !prev.extendedUrinaryCatheter
                      }));
                    }}
                  >
                    Urinkatheter
                  </Button>
                </Box>
              </Grid>
              
              {/* Blutstillung */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Blutstillung:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant={formData.hemostasisTq ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        hemostasisTq: !prev.hemostasisTq
                      }));
                    }}
                  >
                    TQ
                  </Button>
                  <Button 
                    variant={formData.hemostasisDv ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        hemostasisDv: !prev.hemostasisDv
                      }));
                    }}
                  >
                    Israeli
                  </Button>
                  <Button 
                    variant={formData.hemostasisWp ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        hemostasisWp: !prev.hemostasisWp
                      }));
                    }}
                  >
                    WP
                  </Button>
                </Box>
              </Grid>
              
              {/* Free text field for additional treatment info */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Weitere Behandlungsmaßnahmen"
                  name="treatmentSoFar"
                  value={formData.treatmentSoFar}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={4}
                  placeholder="Weitere Details zur bisherigen Behandlung..."
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Zurück
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Weiter
              </Button>
            </Box>
          </Box>
        );
        
      case 4:
        return (
          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Zusammenfassung
            </Typography>
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Session erfolgreich erstellt! Sie werden weitergeleitet...
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Session: {formData.sessionCategory || `Patient ${formData.patientCode}`}
              </Typography>
              <Typography variant="body2">
                Session-ID: {formData.patientCode}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.color 
              }}>
                Priorität: {PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.label}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Patienten-Daten
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Alter: {formData.patientAge || 'Nicht angegeben'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Geschlecht: {GENDER_OPTIONS.find(g => g.value === formData.patientGender)?.label}
                  </Typography>
                </Grid>
                {formData.accidentTimeHour && formData.accidentTimeMinute && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Zeitpunkt des Unfalls: {`${String(formData.accidentTimeHour).padStart(2, '0')}:${String(formData.accidentTimeMinute).padStart(2, '0')} Uhr`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Verletzungshergang
              </Typography>
              {formData.injuryProcess && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Verletzungshergang:</strong> {formData.injuryProcess}
                </Typography>
              )}
              
              {formData.injuries && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Verletzungen:</strong> {formData.injuries}
                </Typography>
              )}
              
              {showPastMedicalHistory && formData.pastMedicalHistory && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Vorerkrankungen:</strong> {formData.pastMedicalHistory}
                </Typography>
              )}
              
              {showAllergies && formData.allergies && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Allergien:</strong> {formData.allergies}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Vitalwerte
              </Typography>
              <Grid container spacing={2}>
                {formData.heartRate ? (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Herzfrequenz: {formData.heartRate} bpm
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Herzfrequenz: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                {formData.systolicBP && formData.diastolicBP ? (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Blutdruck: {formData.systolicBP}/{formData.diastolicBP} mmHg
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Blutdruck: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                {formData.oxygenSaturation ? (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      O₂-Sättigung: {formData.oxygenSaturation}%
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      O₂-Sättigung: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                {formData.respiratoryRate ? (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Atemfrequenz: {formData.respiratoryRate} /min
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Atemfrequenz: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                {formData.temperature ? (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Temperatur: {formData.temperature} °C
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Temperatur: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                {formData.bloodGlucose ? (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Blutzucker: {formData.bloodGlucose} mg/dL
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Blutzucker: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    Schmerz: {formData.painLevel}/10
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    Bewusstsein: {CONSCIOUSNESS_OPTIONS.find(c => c.value === formData.consciousness)?.label}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Behandlung bisher
              </Typography>
              
              <Grid container spacing={2}>
                {/* Zugang summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Zugang:</strong> {formData.accessPvk ? 'PVK ' : ''}
                    {formData.accessIo ? 'IO ' : ''}
                    {formData.accessZvk ? 'ZVK ' : ''}
                    {formData.accessArterial ? 'Arteriell ' : ''}
                    {!formData.accessPvk && !formData.accessIo && !formData.accessZvk && !formData.accessArterial && 
                      'Kein'}
                  </Typography>
                </Grid>
                
                {/* Perfusoren summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Perfusoren:</strong> {formData.perfusorCount ? `${formData.perfusorCount} Perfusor${formData.perfusorCount > 1 ? 'en' : ''}: ${formData.perfusors || 'keine Medikation angegeben'}` : 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Laufende Medikation summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Laufende/vergangene Medikation:</strong> {medicationText || 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Reanimation summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Reanimation:</strong> {formData.reanimation || 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Intubation summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Intubation:</strong> {formData.intubationSga ? 'SGA ' : ''}
                    {formData.intubationTubus ? 'Endotr. Tubus ' : ''}
                    {formData.intubationKoniotomie ? 'Koniotomie ' : ''}
                    {!formData.intubationSga && !formData.intubationTubus && !formData.intubationKoniotomie && 
                      'Keine'}
                  </Typography>
                </Grid>
                
                {/* Beatmung summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Atmung / Beatmung:</strong> {formData.ventilationManual ? 'Manuell ' : ''}
                    {formData.ventilationMechanical ? (
                      <>
                        Maschinell
                        {formData.ventilationPeep && ` (PEEP: ${formData.ventilationPeep} mbar)`}
                        {formData.ventilationFio2 && ` (FiO₂: ${formData.ventilationFio2}%)`}
                        {formData.ventilationTidalVolume && ` (Tidalvolumen: ${formData.ventilationTidalVolume} ml)`}
                        {formData.ventilationRespiratoryRate && ` (Atemfrequenz: ${formData.ventilationRespiratoryRate}/min)`}
                        {formData.ventilationInspiratoryTime && ` (Inspirationszeit: ${formData.ventilationInspiratoryTime}s)`}
                        {formData.ventilationMode && ` (Modus: ${formData.ventilationMode})`}
                      </>
                    ) : ''}
                    {!formData.ventilationManual && !formData.ventilationMechanical && 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Thorax Drainage summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Thorax Drainage:</strong> {formData.thoraxDrainageRight ? 'Rechts ' : ''}
                    {formData.thoraxDrainageLeft ? 'Links ' : ''}
                    {!formData.thoraxDrainageRight && !formData.thoraxDrainageLeft && 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Dekompression summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Dekompression:</strong> {formData.decompressionRight ? 'Rechts ' : ''}
                    {formData.decompressionLeft ? 'Links ' : ''}
                    {!formData.decompressionRight && !formData.decompressionLeft && 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Erweiterte Maßnahmen summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Erweiterte Maßnahmen:</strong> {formData.extendedNarcosis ? 'Narkose ' : ''}
                    {formData.extendedStiffneck ? 'Stiffneck ' : ''}
                    {formData.extendedVacuumMattress ? 'Vakuum-Matratze ' : ''}
                    {formData.extendedGastricTube ? 'Magensonde ' : ''}
                    {formData.extendedUrinaryCatheter ? 'Urinkatheter ' : ''}
                    {!formData.extendedNarcosis && !formData.extendedStiffneck && 
                     !formData.extendedVacuumMattress && !formData.extendedGastricTube && 
                     !formData.extendedUrinaryCatheter && 'Keine'}
                  </Typography>
                </Grid>
                
                {/* Blutstillung summary */}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Blutstillung:</strong> {formData.hemostasisTq ? 'TQ ' : ''}
                    {formData.hemostasisDv ? 'Israeli ' : ''}
                    {formData.hemostasisWp ? 'WP ' : ''}
                    {!formData.hemostasisTq && !formData.hemostasisDv && !formData.hemostasisWp && 'Keine'}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Free text treatment info */}
              {formData.treatmentSoFar && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Weitere Behandlungsmaßnahmen:</strong> {formData.treatmentSoFar}
                </Typography>
              )}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
              >
                Zurück
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || success}
              >
                {loading ? 'Wird erstellt...' : 'Session erstellen'}
              </Button>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Neue Session erstellen
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Füllen Sie das Formular aus, um eine neue Patienten-Session zu erstellen.
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Card>
        {renderStep()}
      </Card>
    </Box>
  );
};

export default NewSession; 