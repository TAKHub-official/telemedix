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
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { sessionService } from '../../services/sessionService';

// Constants for form
const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Niedrig', color: 'success.main' },
  { value: 'NORMAL', label: 'Normal', color: 'info.main' },
  { value: 'HIGH', label: 'Hoch', color: 'warning.main' },
  { value: 'URGENT', label: 'Notfall', color: 'error.main' }
];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Männlich' },
  { value: 'FEMALE', label: 'Weiblich' },
  { value: 'OTHER', label: 'Divers' }
];

const CONSCIOUSNESS_OPTIONS = [
  { value: 'ALERT', label: 'Wach und orientiert' },
  { value: 'VERBAL', label: 'Reaktion auf Ansprache' },
  { value: 'PAIN', label: 'Reaktion auf Schmerzreiz' },
  { value: 'UNRESPONSIVE', label: 'Keine Reaktion' }
];

// Vorgefertigte Werte für Vitalzeichen
const HEART_RATE_OPTIONS = [
  { value: '<20', label: '<20 bpm (sehr niedrig)', isLow: true },
  { value: '60', label: '60 bpm (Normalwert)', isNormal: true },
  ...Array.from({ length: 34 }, (_, i) => ({ value: String(20 + i * 5), label: `${20 + i * 5} bpm` })),
  { value: '>190', label: '>190 bpm (sehr hoch)', isHigh: true }
];

const SYSTOLIC_BP_OPTIONS = [
  { value: '<40', label: '<40 mmHg (sehr niedrig)', isLow: true },
  { value: '120', label: '120 mmHg (Normalwert)', isNormal: true },
  ...Array.from({ length: 42 }, (_, i) => ({ value: String(40 + i * 5), label: `${40 + i * 5} mmHg` })),
  { value: '>250', label: '>250 mmHg (sehr hoch)', isHigh: true }
];

const DIASTOLIC_BP_OPTIONS = [
  { value: '<30', label: '<30 mmHg (sehr niedrig)', isLow: true },
  { value: '80', label: '80 mmHg (Normalwert)', isNormal: true },
  ...Array.from({ length: 24 }, (_, i) => ({ value: String(30 + i * 5), label: `${30 + i * 5} mmHg` })),
  { value: '>150', label: '>150 mmHg (sehr hoch)', isHigh: true }
];

const OXYGEN_SATURATION_OPTIONS = [
  { value: '98', label: '98% (Normalwert)', isNormal: true },
  ...Array.from({ length: 41 }, (_, i) => ({ value: String(60 + i), label: `${60 + i}%` }))
];

const RESPIRATORY_RATE_OPTIONS = [
  { value: '0', label: '0 /min (Atemstillstand)', isLow: true },
  { value: '14', label: '14 /min (Normalwert)', isNormal: true },
  ...Array.from({ length: 30 }, (_, i) => ({ value: String(1 + i), label: `${1 + i} /min` })),
  { value: '>30', label: '>30 /min (sehr hoch)', isHigh: true }
];

const TEMPERATURE_OPTIONS = [
  { value: '36.5', label: '36.5 °C (Normalwert)', isNormal: true },
  ...Array.from({ length: 91 }, (_, i) => ({ value: (34 + i * 0.1).toFixed(1), label: `${(34 + i * 0.1).toFixed(1)} °C` }))
];

const BLOOD_GLUCOSE_OPTIONS = [
  { value: '100', label: '100 mg/dL (Normalwert)', isNormal: true },
  ...Array.from({ length: 61 }, (_, i) => ({ value: String(40 + i * 10), label: `${40 + i * 10} mg/dL` }))
];

// Generate age options from 1 to 120 years
const AGE_OPTIONS = Array.from({ length: 120 }, (_, i) => ({ 
  value: String(i + 1), 
  label: `${i + 1} Jahre` 
}));

const NewSession = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedPatientId, setGeneratedPatientId] = useState('');
  
  // Generate a unique patient ID on component mount
  useEffect(() => {
    generatePatientId();
  }, []);
  
  // Generate a unique patient ID with format P[YY][MM][DD][###]
  const generatePatientId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (1-12) padded to 2 digits
    const day = now.getDate().toString().padStart(2, '0'); // Day padded to 2 digits
    
    // Generate a random 3-digit number for the sequence
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const patientId = `P${year}${month}${day}${sequence}`;
    setGeneratedPatientId(patientId);
    
    // Update form data with the generated ID
    setFormData(prev => ({
      ...prev,
      patientCode: patientId
    }));
  };
  
  // Form state
  const [formData, setFormData] = useState({
    // Session data
    title: '',
    patientCode: '',
    priority: 'NORMAL',
    
    // Patient data
    patientAge: '45', // Default age is now 45
    patientGender: 'MALE',
    
    // Vital signs - setze Standardwerte
    heartRate: '60',  // Normalwert
    systolicBP: '120',  // Normalwert
    diastolicBP: '80',  // Normalwert
    oxygenSaturation: '98',  // Normalwert
    respiratoryRate: '14',  // Normalwert
    temperature: '36.5',  // Normalwert
    bloodGlucose: '100',  // Normalwert
    painLevel: '0',
    consciousness: 'ALERT',
    
    // Incident details
    chiefComplaint: '',
    incidentDescription: '',
    pastMedicalHistory: '',
    allergies: '',
    medications: ''
  });
  
  // Steps for the form
  const steps = [
    'Patienten-Daten',
    'Vitalwerte',
    'Vorfall',
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
      
      // Prepare data for API request
      const sessionData = {
        title: formData.title || `Patient ${formData.patientCode}`,
        patientCode: formData.patientCode,
        priority: formData.priority,
        medicalRecord: {
          patientHistory: JSON.stringify({
            personalInfo: {
              fullName: formData.title || `Patient ${formData.patientCode}`,
              age: formData.patientAge,
              gender: formData.patientGender === 'MALE' ? 'Männlich' : 
                     formData.patientGender === 'FEMALE' ? 'Weiblich' : 'Divers'
            },
            gender: formData.patientGender === 'MALE' ? 'Männlich' : 
                    formData.patientGender === 'FEMALE' ? 'Weiblich' : 'Divers',
            chiefComplaint: formData.chiefComplaint,
            incidentDescription: formData.incidentDescription,
            pastMedicalHistory: formData.pastMedicalHistory
          }),
          allergies: formData.allergies,
          currentMedications: formData.medications
        }
      };
      
      // Create session
      const response = await sessionService.createSession(sessionData);
      
      // If successful, add vital signs
      if (response.session && response.session.id) {
        const sessionId = response.session.id;
        
        // Add vital signs one by one
        if (formData.heartRate) {
          await sessionService.addVitalSign(sessionId, {
            type: 'HEART_RATE',
            value: formData.heartRate,
            unit: 'bpm'
          });
        }
        
        if (formData.systolicBP && formData.diastolicBP) {
          await sessionService.addVitalSign(sessionId, {
            type: 'BLOOD_PRESSURE',
            value: `${formData.systolicBP}/${formData.diastolicBP}`,
            unit: 'mmHg'
          });
        }
        
        if (formData.oxygenSaturation) {
          await sessionService.addVitalSign(sessionId, {
            type: 'OXYGEN_SATURATION',
            value: formData.oxygenSaturation,
            unit: '%'
          });
        }
        
        if (formData.respiratoryRate) {
          await sessionService.addVitalSign(sessionId, {
            type: 'RESPIRATORY_RATE',
            value: formData.respiratoryRate,
            unit: 'breaths/min'
          });
        }
        
        if (formData.temperature) {
          await sessionService.addVitalSign(sessionId, {
            type: 'TEMPERATURE',
            value: formData.temperature,
            unit: '°C'
          });
        }
        
        if (formData.bloodGlucose) {
          await sessionService.addVitalSign(sessionId, {
            type: 'BLOOD_GLUCOSE',
            value: formData.bloodGlucose,
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
                <TextField
                  required
                  fullWidth
                  label="Session-Titel"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="z.B. Notfall - Brustschmerzen"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Patienten-Code"
                  name="patientCode"
                  value={formData.patientCode}
                  disabled={true} // Disable manual entry
                  margin="normal"
                  helperText="Automatisch generierter Patienten-Code"
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
                disabled={!formData.title} // Only title is required now
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
        
      case 2:
        return (
          <Box component="form" sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Informationen zum Vorfall
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hauptbeschwerde"
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="z.B. Akute Brustschmerzen, Atemnot"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Beschreibung des Vorfalls"
                  name="incidentDescription"
                  value={formData.incidentDescription}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={4}
                  placeholder="Detaillierte Beschreibung des Vorfalls oder der Verletzung..."
                />
              </Grid>
              
              <Grid item xs={12}>
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
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Allergien"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="z.B. Penicillin, Nüsse, Latex..."
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aktuelle Medikation"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="z.B. Aspirin, Insulin, Betablocker..."
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
        
      case 3:
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
                Session: {formData.title || `Patient ${formData.patientCode}`}
              </Typography>
              <Typography variant="body2">
                Patienten-Code: {formData.patientCode}
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
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Vitalwerte
              </Typography>
              <Grid container spacing={2}>
                {formData.heartRate && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Herzfrequenz: {formData.heartRate} bpm
                    </Typography>
                  </Grid>
                )}
                
                {formData.systolicBP && formData.diastolicBP && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Blutdruck: {formData.systolicBP}/{formData.diastolicBP} mmHg
                    </Typography>
                  </Grid>
                )}
                
                {formData.oxygenSaturation && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      O₂-Sättigung: {formData.oxygenSaturation}%
                    </Typography>
                  </Grid>
                )}
                
                {formData.respiratoryRate && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Atemfrequenz: {formData.respiratoryRate} /min
                    </Typography>
                  </Grid>
                )}
                
                {formData.temperature && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Temperatur: {formData.temperature} °C
                    </Typography>
                  </Grid>
                )}
                
                {formData.bloodGlucose && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Blutzucker: {formData.bloodGlucose} mg/dL
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
                Vorfall / Anamnese
              </Typography>
              {formData.chiefComplaint && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Hauptbeschwerde:</strong> {formData.chiefComplaint}
                </Typography>
              )}
              
              {formData.incidentDescription && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Beschreibung:</strong> {formData.incidentDescription}
                </Typography>
              )}
              
              {formData.pastMedicalHistory && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Vorerkrankungen:</strong> {formData.pastMedicalHistory}
                </Typography>
              )}
              
              {formData.allergies && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Allergien:</strong> {formData.allergies}
                </Typography>
              )}
              
              {formData.medications && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Medikation:</strong> {formData.medications}
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