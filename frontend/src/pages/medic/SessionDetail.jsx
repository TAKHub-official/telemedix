import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { sessionService } from '../../services/sessionService';
import { 
  HEART_RATE_OPTIONS,
  SYSTOLIC_BP_OPTIONS,
  DIASTOLIC_BP_OPTIONS,
  OXYGEN_SATURATION_OPTIONS,
  RESPIRATORY_RATE_OPTIONS,
  TEMPERATURE_OPTIONS,
  BLOOD_GLUCOSE_OPTIONS,
  CONSCIOUSNESS_OPTIONS
} from '../../constants';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // State für direkte Bearbeitung der Vitalwerte
  const [currentVitalValues, setCurrentVitalValues] = useState({
    HEART_RATE: { value: '', unit: 'bpm' },
    BLOOD_PRESSURE: { systolic: '', diastolic: '', unit: 'mmHg' },
    OXYGEN_SATURATION: { value: '', unit: '%' },
    RESPIRATORY_RATE: { value: '', unit: 'breaths/min' },
    TEMPERATURE: { value: '', unit: '°C' },
    BLOOD_GLUCOSE: { value: '', unit: 'mg/dL' },
    PAIN_LEVEL: { value: '', unit: '/10' },
    CONSCIOUSNESS: { value: '', unit: '' }
  });
  const [showEditVitals, setShowEditVitals] = useState(false);
  const [updatingAllVitals, setUpdatingAllVitals] = useState(false);
  
  // Dialog-States für Vitalwerte aktualisieren
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updatingVitalType, setUpdatingVitalType] = useState(null);
  const [selectedVitalValue, setSelectedVitalValue] = useState('');
  const [selectedVitalUnit, setSelectedVitalUnit] = useState('');
  const [updatingError, setUpdatingError] = useState(null);
  const [updatingLoading, setUpdatingLoading] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching session details for ID:', id);
        const response = await sessionService.getSessionById(id);
        console.log('Session response received:', response);
        
        // Handle different response structures
        let sessionData = null;
        if (response && response.data && response.data.session) {
          sessionData = response.data.session;
        } else if (response && response.session) {
          sessionData = response.session;
        } else if (response && response.data) {
          sessionData = response.data;
        }
        
        if (sessionData) {
          console.log('Session data extracted:', sessionData);
          setSession(sessionData);
          // Initialisiere aktuelle Vitalwerte aus Session-Daten
          initializeVitalValues(sessionData.vitalSigns);
        } else {
          console.error('No session data found in response');
          setError('Keine Session-Daten gefunden');
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('Fehler beim Laden der Session-Details. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
  }, [id]);

  // Initialisiere aktuelle Vitalwerte aus den vorhandenen Werten
  const initializeVitalValues = (vitalSigns) => {
    if (!vitalSigns || vitalSigns.length === 0) return;
    
    const newVitalValues = { ...currentVitalValues };
    
    ['HEART_RATE', 'OXYGEN_SATURATION', 'RESPIRATORY_RATE', 'TEMPERATURE', 'BLOOD_GLUCOSE', 'PAIN_LEVEL', 'CONSCIOUSNESS'].forEach(type => {
      const latestVital = getLatestVitalSignByType(vitalSigns, type);
      if (latestVital) {
        newVitalValues[type] = {
          value: latestVital.value,
          unit: latestVital.unit
        };
      }
    });
    
    // Spezialbehandlung für Blutdruck
    const latestBP = getLatestVitalSignByType(vitalSigns, 'BLOOD_PRESSURE');
    if (latestBP) {
      const [systolic, diastolic] = latestBP.value.split('/');
      newVitalValues.BLOOD_PRESSURE = {
        systolic,
        diastolic,
        unit: latestBP.unit
      };
    }
    
    setCurrentVitalValues(newVitalValues);
  };

  const handleBack = () => {
    navigate('/medic/sessions');
  };

  // Helper function to render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'OPEN':
        return <Chip label="Offen" color="warning" />;
      case 'ASSIGNED':
        return <Chip label="Zugewiesen" color="info" />;
      case 'IN_PROGRESS':
        return <Chip label="In Bearbeitung" color="primary" />;
      case 'COMPLETED':
        return <Chip label="Abgeschlossen" color="success" />;
      default:
        return <Chip label={status} />;
    }
  };

  // Helper function to render priority chip
  const renderPriorityChip = (priority) => {
    switch (priority) {
      case 'LOW':
        return <Chip label="Niedrig" color="success" size="small" variant="outlined" />;
      case 'NORMAL':
        return <Chip label="Normal" color="info" size="small" variant="outlined" />;
      case 'HIGH':
        return <Chip label="Hoch" color="error" size="small" />;
      default:
        return <Chip label={priority} size="small" variant="outlined" />;
    }
  };

  // Parse medical record data
  const getMedicalRecordData = () => {
    if (!session?.medicalRecord?.patientHistory) return null;
    
    try {
      return JSON.parse(session.medicalRecord.patientHistory);
    } catch (error) {
      console.error('Error parsing patient history:', error);
      return null;
    }
  };

  const medicalRecordData = getMedicalRecordData();

  // Hilfsfunktion, um den letzten Wert eines bestimmten Vitalzeichens zu finden
  const getLatestVitalSignByType = (vitalSigns, type) => {
    if (!vitalSigns || vitalSigns.length === 0) return null;
    
    const filteredSigns = vitalSigns.filter(sign => sign.type === type);
    if (filteredSigns.length === 0) return null;
    
    // Sortiere nach Zeitstempel, neuster zuerst
    return filteredSigns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  };
  
  // Funktion zum Öffnen des Update-Dialogs
  const handleOpenUpdateDialog = (vitalType) => {
    setUpdatingVitalType(vitalType);
    setUpdatingError(null);
    
    // Finde den letzten Wert des ausgewählten Vitalzeichens
    const latestVital = getLatestVitalSignByType(session.vitalSigns, vitalType);
    
    // Setze Standardwerte basierend auf dem letzten Wert
    if (latestVital) {
      if (vitalType === 'BLOOD_PRESSURE') {
        // Für Blutdruck müssen wir Systolisch/Diastolisch trennen
        const [systolic, diastolic] = latestVital.value.split('/');
        setSelectedVitalValue({ systolic, diastolic });
      } else {
        setSelectedVitalValue(latestVital.value);
      }
      setSelectedVitalUnit(latestVital.unit);
    } else {
      // Setze Standardwerte, wenn keine vorherigen Werte vorhanden sind
      if (vitalType === 'BLOOD_PRESSURE') {
        setSelectedVitalValue({ systolic: '120', diastolic: '80' });
        setSelectedVitalUnit('mmHg');
      } else {
        setSelectedVitalValue('');
        setSelectedVitalUnit(
          vitalType === 'HEART_RATE' ? 'bpm' :
          vitalType === 'OXYGEN_SATURATION' ? '%' :
          vitalType === 'RESPIRATORY_RATE' ? 'breaths/min' :
          vitalType === 'TEMPERATURE' ? '°C' :
          vitalType === 'BLOOD_GLUCOSE' ? 'mg/dL' :
          vitalType === 'PAIN_LEVEL' ? '/10' :
          vitalType === 'CONSCIOUSNESS' ? 'AVPU' : ''
        );
      }
    }
    
    setUpdateDialogOpen(true);
  };
  
  // Funktion zum Schließen des Update-Dialogs
  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setUpdatingVitalType(null);
    setSelectedVitalValue('');
    setSelectedVitalUnit('');
    setUpdatingError(null);
  };
  
  // Funktion zum Ändern der Vitalwerte im Dialog
  const handleVitalValueChange = (event) => {
    if (updatingVitalType === 'BLOOD_PRESSURE') {
      // Für Blutdruck behandeln wir systolisch und diastolisch getrennt
      const { name, value } = event.target;
      setSelectedVitalValue(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setSelectedVitalValue(event.target.value);
    }
  };
  
  // Handler für direkte Änderungen an Vitalwerten
  const handleDirectVitalChange = (type, value) => {
    if (type === 'BLOOD_PRESSURE') {
      // Spezialbehandlung für Blutdruck
      const { name, value: newValue } = value;
      setCurrentVitalValues(prev => ({
        ...prev,
        BLOOD_PRESSURE: {
          ...prev.BLOOD_PRESSURE,
          [name]: newValue
        }
      }));
    } else {
      // Standardbehandlung für andere Vitalwerte
      setCurrentVitalValues(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          value
        }
      }));
    }
  };
  
  // Funktion zum Umschalten des Bearbeitungsmodus
  const toggleEditMode = () => {
    // Wenn wir im Bearbeitungsmodus sind und "Speichern" klicken
    if (showEditVitals) {
      // Rufe die Funktion zum Aktualisieren aller Vitalwerte auf
      handleUpdateAllVitalSigns();
    } else {
      // Andernfalls schalte einfach den Bearbeitungsmodus ein
      setShowEditVitals(true);
    }
  };

  // Funktion zum Aktualisieren aller Vitalwerte
  const handleUpdateAllVitalSigns = async () => {
    try {
      setUpdatingAllVitals(true);
      setUpdatingError(null);
      
      // Sammele alle zu aktualisierenden Vitalwerte
      const updatePromises = [];
      
      // Standard Vitalzeichen (nicht Blutdruck)
      ['HEART_RATE', 'OXYGEN_SATURATION', 'RESPIRATORY_RATE', 'TEMPERATURE', 'BLOOD_GLUCOSE', 'PAIN_LEVEL', 'CONSCIOUSNESS'].forEach(type => {
        const vitalData = currentVitalValues[type];
        // Sende alle Werte, die gesetzt sind (auch unveränderte)
        if (vitalData.value) {
          updatePromises.push(
            sessionService.addVitalSign(id, {
              type,
              value: vitalData.value,
              unit: vitalData.unit
            })
          );
        }
      });
      
      // Blutdruck separat behandeln
      const bp = currentVitalValues.BLOOD_PRESSURE;
      if (bp.systolic && bp.diastolic) {
        updatePromises.push(
          sessionService.addVitalSign(id, {
            type: 'BLOOD_PRESSURE',
            value: `${bp.systolic}/${bp.diastolic}`,
            unit: bp.unit
          })
        );
      }
      
      // Wenn keine Werte gesetzt sind, zeige eine Fehlermeldung
      if (updatePromises.length === 0) {
        setUpdatingError('Bitte geben Sie mindestens einen Vitalwert ein.');
        setUpdatingAllVitals(false);
        return;
      }
      
      // Alle Aktualisierungen parallel ausführen
      await Promise.all(updatePromises);
      
      // Session-Daten neu laden
      const updatedSessionResponse = await sessionService.getSessionById(id);
      
      // Extrahiere die Sessiondaten aus der Antwort
      let updatedSessionData = null;
      if (updatedSessionResponse && updatedSessionResponse.data && updatedSessionResponse.data.session) {
        updatedSessionData = updatedSessionResponse.data.session;
      } else if (updatedSessionResponse && updatedSessionResponse.session) {
        updatedSessionData = updatedSessionResponse.session;
      } else if (updatedSessionResponse && updatedSessionResponse.data) {
        updatedSessionData = updatedSessionResponse.data;
      }
      
      if (updatedSessionData) {
        setSession(updatedSessionData);
        // Initialisiere die Vitalwerte erneut mit den aktualisierten Daten
        initializeVitalValues(updatedSessionData.vitalSigns);
        // Zurück zum Ansichtsmodus wechseln
        setShowEditVitals(false);
      }
      
      setUpdateSuccess(true);
      // Erfolgsmeldung nach 3 Sekunden ausblenden
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating vital signs:', err);
      setUpdatingError('Fehler beim Aktualisieren der Vitalwerte. Bitte versuchen Sie es später erneut.');
    } finally {
      setUpdatingAllVitals(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="info">Session nicht gefunden.</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Zurück zur Übersicht
      </Button>
      
      {/* Session Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {session.title}
          </Typography>
          <Stack direction="row" spacing={1}>
            {renderStatusChip(session.status)}
            {renderPriorityChip(session.priority)}
          </Stack>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Session-ID:</strong> {session.patientCode}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Erstellt am:</strong> {new Date(session.createdAt).toLocaleString('de-DE')}
            </Typography>
          </Grid>
          
          {session.assignedTo && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Zugewiesen an:</strong> {session.assignedTo.firstName} {session.assignedTo.lastName}
              </Typography>
            </Grid>
          )}
          
          {session.completedAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Abgeschlossen am:</strong> {new Date(session.completedAt).toLocaleString('de-DE')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Medical Record */}
      {session.medicalRecord && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Patientendaten
            </Typography>
            
            <Grid container spacing={2}>
              {medicalRecordData && (
                <>
                  {medicalRecordData.personalInfo && medicalRecordData.personalInfo.age && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Alter:</strong> {medicalRecordData.personalInfo.age}
                      </Typography>
                    </Grid>
                  )}
                  
                  {medicalRecordData.personalInfo && medicalRecordData.personalInfo.gender && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Geschlecht:</strong> {medicalRecordData.personalInfo.gender}
                      </Typography>
                    </Grid>
                  )}
                  
                  {medicalRecordData.accidentTime && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Zeitpunkt des Unfalls:</strong> {medicalRecordData.accidentTime}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Injury Information */}
      {medicalRecordData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Verletzungshergang
            </Typography>
            
            <Grid container spacing={2}>
              {medicalRecordData.injuryProcess && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Verletzungshergang:</strong>
                    <Box component="p" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {medicalRecordData.injuryProcess}
                    </Box>
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.injuries && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Verletzungen:</strong>
                    <Box component="p" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {medicalRecordData.injuries}
                    </Box>
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.pastMedicalHistory && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Vorerkrankungen:</strong>
                    <Box component="p" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {medicalRecordData.pastMedicalHistory}
                    </Box>
                  </Typography>
                </Grid>
              )}
              
              {session.medicalRecord.allergies && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Allergien:</strong> {session.medicalRecord.allergies}
                  </Typography>
                </Grid>
              )}
              
              {session.medicalRecord.currentMedications && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Aktuelle Medikation:</strong> {session.medicalRecord.currentMedications}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Previous Treatment */}
      {medicalRecordData && medicalRecordData.treatment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Behandlung bisher
            </Typography>
            
            <Grid container spacing={2}>
              {medicalRecordData.treatment.circulation && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Kreislauf:</strong> {medicalRecordData.treatment.circulation}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.breathing && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Atmung:</strong> {medicalRecordData.treatment.breathing}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.cSpine && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>C-Spine:</strong> {medicalRecordData.treatment.cSpine}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.access && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Zugang:</strong> {medicalRecordData.treatment.access}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.intubation && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Intubation:</strong> {medicalRecordData.treatment.intubation}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.hemostasis && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Blutstillung:</strong> {medicalRecordData.treatment.hemostasis}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.analgesia && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Schmerzbekämpfung:</strong> {medicalRecordData.treatment.analgesia}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.perfusors && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Perfusoren:</strong> {medicalRecordData.treatment.perfusors}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.medicationText && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Laufende Medikation:</strong> {medicalRecordData.treatment.medicationText}
                  </Typography>
                </Grid>
              )}
              
              {medicalRecordData.treatment.extendedMeasures && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Erweiterte Maßnahmen:</strong> {medicalRecordData.treatment.extendedMeasures}
                  </Typography>
                </Grid>
              )}
              
              {session.notes && session.notes.length > 0 && session.notes.find(note => note.type === 'TREATMENT_DESCRIPTION') && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Behandlungsdetails:</strong>
                    <Box component="p" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {session.notes.find(note => note.type === 'TREATMENT_DESCRIPTION')?.content}
                    </Box>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Vital Signs */}
      {session.vitalSigns && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Vitalwerte
              </Typography>
              
              <Box>
                {/* Erfolgsmeldung anzeigen, wenn ein Vitalwert aktualisiert wurde */}
                {updateSuccess && (
                  <Chip
                    label="Vitalwerte erfolgreich aktualisiert"
                    color="success"
                    size="small"
                    sx={{ mr: 2 }}
                  />
                )}
                
                {/* Toggle-Button für Bearbeitungsmodus */}
                <Button 
                  variant={showEditVitals ? "contained" : "outlined"} 
                  color="primary"
                  onClick={toggleEditMode}
                  startIcon={showEditVitals ? <SaveIcon /> : <EditIcon />}
                >
                  {showEditVitals ? "Vitalwerte speichern" : "Vitalwerte bearbeiten"}
                </Button>
              </Box>
            </Box>
            
            {/* Fehlermeldung anzeigen */}
            {updatingError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updatingError}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              {/* Herzfrequenz */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Herzfrequenz:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.HEART_RATE.value}
                      onChange={(e) => handleDirectVitalChange('HEART_RATE', e.target.value)}
                      displayEmpty
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
                ) : (
                  <>
                    {currentVitalValues.HEART_RATE.value ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.HEART_RATE.value} {currentVitalValues.HEART_RATE.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'HEART_RATE')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'HEART_RATE').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Blutdruck */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Blutdruck:
                </Typography>
                
                {showEditVitals ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel id="systolic-edit-label">Systolisch</InputLabel>
                      <Select
                        labelId="systolic-edit-label"
                        value={currentVitalValues.BLOOD_PRESSURE.systolic}
                        onChange={(e) => handleDirectVitalChange('BLOOD_PRESSURE', { name: 'systolic', value: e.target.value })}
                        label="Systolisch"
                        displayEmpty
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
                    
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel id="diastolic-edit-label">Diastolisch</InputLabel>
                      <Select
                        labelId="diastolic-edit-label"
                        value={currentVitalValues.BLOOD_PRESSURE.diastolic}
                        onChange={(e) => handleDirectVitalChange('BLOOD_PRESSURE', { name: 'diastolic', value: e.target.value })}
                        label="Diastolisch"
                        displayEmpty
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
                  </Box>
                ) : (
                  <>
                    {currentVitalValues.BLOOD_PRESSURE.systolic && currentVitalValues.BLOOD_PRESSURE.diastolic ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.BLOOD_PRESSURE.systolic}/{currentVitalValues.BLOOD_PRESSURE.diastolic} {currentVitalValues.BLOOD_PRESSURE.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'BLOOD_PRESSURE')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'BLOOD_PRESSURE').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Sauerstoffsättigung */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Sauerstoffsättigung:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.OXYGEN_SATURATION.value}
                      onChange={(e) => handleDirectVitalChange('OXYGEN_SATURATION', e.target.value)}
                      displayEmpty
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
                ) : (
                  <>
                    {currentVitalValues.OXYGEN_SATURATION.value ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.OXYGEN_SATURATION.value} {currentVitalValues.OXYGEN_SATURATION.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'OXYGEN_SATURATION')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'OXYGEN_SATURATION').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Atemfrequenz */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Atemfrequenz:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.RESPIRATORY_RATE.value}
                      onChange={(e) => handleDirectVitalChange('RESPIRATORY_RATE', e.target.value)}
                      displayEmpty
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
                ) : (
                  <>
                    {currentVitalValues.RESPIRATORY_RATE.value ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.RESPIRATORY_RATE.value} {currentVitalValues.RESPIRATORY_RATE.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'RESPIRATORY_RATE')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'RESPIRATORY_RATE').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Temperatur */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Temperatur:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.TEMPERATURE.value}
                      onChange={(e) => handleDirectVitalChange('TEMPERATURE', e.target.value)}
                      displayEmpty
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
                ) : (
                  <>
                    {currentVitalValues.TEMPERATURE.value ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.TEMPERATURE.value} {currentVitalValues.TEMPERATURE.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'TEMPERATURE')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'TEMPERATURE').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Blutzucker */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Blutzucker:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.BLOOD_GLUCOSE.value}
                      onChange={(e) => handleDirectVitalChange('BLOOD_GLUCOSE', e.target.value)}
                      displayEmpty
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
                ) : (
                  <>
                    {currentVitalValues.BLOOD_GLUCOSE.value ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.BLOOD_GLUCOSE.value} {currentVitalValues.BLOOD_GLUCOSE.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'BLOOD_GLUCOSE')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'BLOOD_GLUCOSE').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Schmerzniveau */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Schmerzniveau:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.PAIN_LEVEL.value}
                      onChange={(e) => handleDirectVitalChange('PAIN_LEVEL', e.target.value)}
                      displayEmpty
                    >
                      {Array.from({ length: 11 }, (_, i) => (
                        <MenuItem key={i} value={String(i)}>
                          {i} - {i === 0 ? 'Keine Schmerzen' : i === 10 ? 'Stärkste Schmerzen' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <>
                    {currentVitalValues.PAIN_LEVEL.value ? (
                      <>
                        <Typography variant="body2">
                          {currentVitalValues.PAIN_LEVEL.value} {currentVitalValues.PAIN_LEVEL.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'PAIN_LEVEL')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'PAIN_LEVEL').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              
              {/* Bewusstseinszustand */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Bewusstseinszustand:
                </Typography>
                
                {showEditVitals ? (
                  <FormControl fullWidth margin="dense" size="small">
                    <Select
                      value={currentVitalValues.CONSCIOUSNESS.value}
                      onChange={(e) => handleDirectVitalChange('CONSCIOUSNESS', e.target.value)}
                      displayEmpty
                    >
                      {CONSCIOUSNESS_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <>
                    {currentVitalValues.CONSCIOUSNESS.value ? (
                      <>
                        <Typography variant="body2">
                          {CONSCIOUSNESS_OPTIONS.find(option => option.value === currentVitalValues.CONSCIOUSNESS.value)?.label || 
                           currentVitalValues.CONSCIOUSNESS.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLatestVitalSignByType(session.vitalSigns, 'CONSCIOUSNESS')?.timestamp && 
                           new Date(getLatestVitalSignByType(session.vitalSigns, 'CONSCIOUSNESS').timestamp).toLocaleString('de-DE')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nicht gemessen
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Treatment Plan */}
      {session.treatmentPlan ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Behandlungsplan
              </Typography>
              <Chip 
                label={
                  session.treatmentPlan.status === 'DRAFT' ? 'Entwurf' :
                  session.treatmentPlan.status === 'ACTIVE' ? 'Aktiv' :
                  session.treatmentPlan.status === 'COMPLETED' ? 'Abgeschlossen' :
                  session.treatmentPlan.status
                } 
                color={
                  session.treatmentPlan.status === 'DRAFT' ? 'default' :
                  session.treatmentPlan.status === 'ACTIVE' ? 'primary' :
                  session.treatmentPlan.status === 'COMPLETED' ? 'success' :
                  'default'
                }
              />
            </Box>
            
            {session.treatmentPlan.diagnosis && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Diagnose:</strong> {session.treatmentPlan.diagnosis}
              </Typography>
            )}
            
            {session.treatmentPlan.steps && session.treatmentPlan.steps.length > 0 ? (
              <List>
                {session.treatmentPlan.steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${index + 1}. ${step.description}`}
                        secondary={
                          <Chip 
                            label={
                              step.status === 'PENDING' ? 'Ausstehend' :
                              step.status === 'IN_PROGRESS' ? 'In Bearbeitung' :
                              step.status === 'COMPLETED' ? 'Abgeschlossen' :
                              step.status
                            } 
                            size="small"
                            color={
                              step.status === 'PENDING' ? 'default' :
                              step.status === 'IN_PROGRESS' ? 'primary' :
                              step.status === 'COMPLETED' ? 'success' :
                              'default'
                            }
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                    {index < session.treatmentPlan.steps.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine Behandlungsschritte definiert.
              </Typography>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Behandlungsplan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Noch kein Behandlungsplan erstellt.
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Notes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sonstige Notizen
          </Typography>
          
          {session.notes && session.notes.length > 0 && session.notes.filter(note => note.type !== 'TREATMENT_DESCRIPTION').length > 0 ? (
            <List>
              {session.notes.filter(note => note.type !== 'TREATMENT_DESCRIPTION').map((note, index, filteredNotes) => (
                <React.Fragment key={note.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        note.title ? (
                          <Typography variant="subtitle1" component="div">
                            {note.title}
                            {note.type && (
                              <Chip
                                size="small"
                                label={note.type}
                                color="primary"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                        ) : null
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body1" 
                            component="div" 
                            sx={{ mt: note.title ? 1 : 0, whiteSpace: 'pre-wrap' }}
                          >
                            {note.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(note.createdAt).toLocaleString('de-DE')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < filteredNotes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Keine Notizen vorhanden.
            </Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog zur Aktualisierung der Vitalwerte */}
      <Dialog 
        open={updateDialogOpen} 
        onClose={handleCloseUpdateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {updatingVitalType === 'HEART_RATE' ? 'Herzfrequenz aktualisieren' :
                updatingVitalType === 'BLOOD_PRESSURE' ? 'Blutdruck aktualisieren' :
                updatingVitalType === 'OXYGEN_SATURATION' ? 'Sauerstoffsättigung aktualisieren' :
                updatingVitalType === 'RESPIRATORY_RATE' ? 'Atemfrequenz aktualisieren' :
                updatingVitalType === 'TEMPERATURE' ? 'Temperatur aktualisieren' :
                updatingVitalType === 'BLOOD_GLUCOSE' ? 'Blutzucker aktualisieren' :
                updatingVitalType === 'PAIN_LEVEL' ? 'Schmerzniveau aktualisieren' :
                updatingVitalType === 'CONSCIOUSNESS' ? 'Bewusstseinszustand aktualisieren' :
                'Vitalwert aktualisieren'}
            </Typography>
            <IconButton onClick={handleCloseUpdateDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {updatingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updatingError}
            </Alert>
          )}
          
          {updatingVitalType === 'BLOOD_PRESSURE' ? (
            // Spezielle Behandlung für Blutdruck mit systolisch/diastolisch
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="systolic-label">Systolisch</InputLabel>
                  <Select
                    labelId="systolic-label"
                    value={selectedVitalValue.systolic || ''}
                    name="systolic"
                    onChange={(event) => handleVitalValueChange(event)}
                    label="Systolisch"
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
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="diastolic-label">Diastolisch</InputLabel>
                  <Select
                    labelId="diastolic-label"
                    value={selectedVitalValue.diastolic || ''}
                    name="diastolic"
                    onChange={(event) => handleVitalValueChange(event)}
                    label="Diastolisch"
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
            </Grid>
          ) : (
            // Standardbehandlung für andere Vitalzeichen
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="vital-value-label">
                {updatingVitalType === 'HEART_RATE' ? 'Herzfrequenz' :
                  updatingVitalType === 'OXYGEN_SATURATION' ? 'Sauerstoffsättigung' :
                  updatingVitalType === 'RESPIRATORY_RATE' ? 'Atemfrequenz' :
                  updatingVitalType === 'TEMPERATURE' ? 'Temperatur' :
                  updatingVitalType === 'BLOOD_GLUCOSE' ? 'Blutzucker' :
                  updatingVitalType === 'PAIN_LEVEL' ? 'Schmerzniveau' :
                  updatingVitalType === 'CONSCIOUSNESS' ? 'Bewusstseinszustand' :
                  'Wert'}
              </InputLabel>
              <Select
                labelId="vital-value-label"
                value={selectedVitalValue}
                onChange={(event) => handleVitalValueChange(event)}
                label={updatingVitalType === 'HEART_RATE' ? 'Herzfrequenz' :
                      updatingVitalType === 'OXYGEN_SATURATION' ? 'Sauerstoffsättigung' :
                      updatingVitalType === 'RESPIRATORY_RATE' ? 'Atemfrequenz' :
                      updatingVitalType === 'TEMPERATURE' ? 'Temperatur' :
                      updatingVitalType === 'BLOOD_GLUCOSE' ? 'Blutzucker' :
                      updatingVitalType === 'PAIN_LEVEL' ? 'Schmerzniveau' :
                      updatingVitalType === 'CONSCIOUSNESS' ? 'Bewusstseinszustand' :
                      'Wert'}
              >
                {updatingVitalType === 'HEART_RATE' && HEART_RATE_OPTIONS.map(option => (
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
                
                {updatingVitalType === 'OXYGEN_SATURATION' && OXYGEN_SATURATION_OPTIONS.map(option => (
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
                
                {updatingVitalType === 'RESPIRATORY_RATE' && RESPIRATORY_RATE_OPTIONS.map(option => (
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
                
                {updatingVitalType === 'TEMPERATURE' && TEMPERATURE_OPTIONS.map(option => (
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
                
                {updatingVitalType === 'BLOOD_GLUCOSE' && BLOOD_GLUCOSE_OPTIONS.map(option => (
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
                
                {updatingVitalType === 'PAIN_LEVEL' && Array.from({ length: 11 }, (_, i) => (
                  <MenuItem key={i} value={String(i)}>
                    {i} - {i === 0 ? 'Keine Schmerzen' : i === 10 ? 'Stärkste Schmerzen' : ''}
                  </MenuItem>
                ))}
                
                {updatingVitalType === 'CONSCIOUSNESS' && CONSCIOUSNESS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Zeitstempel: {new Date().toLocaleString('de-DE')}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog}>
            Abbrechen
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateAllVitalSigns}
            disabled={updatingLoading || 
              (updatingVitalType === 'BLOOD_PRESSURE' ? 
                !selectedVitalValue.systolic || !selectedVitalValue.diastolic : 
                !selectedVitalValue)}
            startIcon={updatingLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {updatingLoading ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionDetail; 