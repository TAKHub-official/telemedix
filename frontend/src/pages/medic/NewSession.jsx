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
  const [showTemperature, setShowTemperature] = useState(false);
  const [showBloodGlucose, setShowBloodGlucose] = useState(false);
  
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
    
    // Vital signs - setze Standardwerte
    heartRate: '60',  // Normalwert
    systolicBP: '120',  // Normalwert
    diastolicBP: '80',  // Normalwert
    oxygenSaturation: '98',  // Normalwert
    respiratoryRate: '14',  // Normalwert
    temperature: '',  // Optional - kein Standardwert
    bloodGlucose: '',  // Optional - kein Standardwert
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
        
        // Nur senden, wenn Temperatur hinzugefügt und ausgewählt wurde
        if (showTemperature && formData.temperature) {
          await sessionService.addVitalSign(sessionId, {
            type: 'TEMPERATURE',
            value: formData.temperature,
            unit: '°C'
          });
        }
        
        // Nur senden, wenn Blutzucker hinzugefügt und ausgewählt wurde
        if (showBloodGlucose && formData.bloodGlucose) {
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
                {!showTemperature ? (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => setShowTemperature(true)}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Temperatur hinzufügen
                  </Button>
                ) : (
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
                )}
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                {!showBloodGlucose ? (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => setShowBloodGlucose(true)}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Blutzucker hinzufügen
                  </Button>
                ) : (
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
                )}
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
                
                {showTemperature && formData.temperature && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Temperatur: {formData.temperature} °C
                    </Typography>
                  </Grid>
                )}
                
                {!showTemperature && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Temperatur: Nicht gemessen
                    </Typography>
                  </Grid>
                )}
                
                {showBloodGlucose && formData.bloodGlucose && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Blutzucker: {formData.bloodGlucose} mg/dL
                    </Typography>
                  </Grid>
                )}
                
                {!showBloodGlucose && (
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