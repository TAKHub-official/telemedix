import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as MedicalServicesIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Thermostat as ThermostatIcon,
  MonitorHeart as MonitorHeartIcon,
  Bloodtype as BloodtypeIcon,
  Air as AirIcon,
  Visibility as VisibilityIcon,
  WaterDrop as WaterDropIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { sessionsAPI, treatmentPlansAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

// Safe parsing of JSON data
const safelyParseJSON = (jsonString, defaultValue = {}) => {
  if (!jsonString) return defaultValue;
  
  // If it's already an object, return it
  if (typeof jsonString === 'object') return jsonString;
  
  try {
    // Check if the string looks like JSON
    if (typeof jsonString === 'string' && 
        (jsonString.startsWith('{') || jsonString.startsWith('['))) {
      return JSON.parse(jsonString);
    }
    // Otherwise return the string as is
    return jsonString;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
};

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [treatmentSteps, setTreatmentSteps] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [newStep, setNewStep] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [user, setUser] = useState(null);
  
  // Fetch session data
  useEffect(() => {
    if (id) {
      loadSessionData();
    }
  }, [id]);
  
  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      // Fetch session data with debug logging
      console.log('Fetching session data for ID:', id);
      const sessionResponse = await sessionsAPI.getById(id);
      console.log('Session response received:', sessionResponse);
      
      // Handle response structure variants
      let sessionData = null;
      if (sessionResponse && sessionResponse.data && sessionResponse.data.session) {
        // Structure: { data: { session: {...} } }
        sessionData = sessionResponse.data.session;
      } else if (sessionResponse && sessionResponse.session) {
        // Structure: { session: {...} }
        sessionData = sessionResponse.session;
      } else if (sessionResponse && sessionResponse.data) {
        // Structure: { data: {...} }
        sessionData = sessionResponse.data;
      }
      
      if (sessionData) {
        console.log('Session data extracted:', sessionData);
        setSession(sessionData);
        
        // Initialisierung von userData
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        // Load treatment plan if this is a doctor viewing
        if (userData?.role === 'DOCTOR') {
          try {
            console.log('Fetching treatment plan for session:', id);
            const result = await treatmentPlansAPI.getBySessionId(id);
            console.log('Treatment plan response:', result);
            
            // Handle treatment plan response variants
            let treatmentPlanData = null;
            if (result && result.data && result.data.treatmentPlan) {
              // Structure: { data: { treatmentPlan: {...} } }
              treatmentPlanData = result.data.treatmentPlan;
            } else if (result && result.treatmentPlan) {
              // Structure: { treatmentPlan: {...} }
              treatmentPlanData = result.treatmentPlan;
            }
            
            if (treatmentPlanData) {
              console.log('Treatment plan extracted:', treatmentPlanData);
              setTreatmentPlan(treatmentPlanData);
              
              // Set additional data
              setDiagnosis(treatmentPlanData.diagnosis || '');
              setTreatmentSteps(treatmentPlanData.steps || []);
            }
          } catch (tpError) {
            console.error('Error loading treatment plan:', tpError);
            // Keine Fehlermeldung für 404, da möglicherweise noch kein Plan existiert
          }
        }
        
        // Clear any previous errors
        setError(null);
      } else {
        console.error('No session data found in response');
        setError('Keine Session-Daten gefunden');
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Fehler beim Laden der Session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAddStep = async () => {
    if (newStep.trim() === '') return;
    
    try {
      setLoading(true);
      
      // If treatment plan doesn't exist yet, create it first
      if (!treatmentPlan) {
        const createPlanResponse = await treatmentPlansAPI.create(id, {
          diagnosis,
          steps: [{ description: newStep }]
        });
        
        if (createPlanResponse && createPlanResponse.data && createPlanResponse.data.treatmentPlan) {
          setTreatmentPlan(createPlanResponse.data.treatmentPlan);
          setTreatmentSteps(createPlanResponse.data.treatmentPlan.steps || []);
          setNewStep('');
          setError(null);
        }
      } else {
        // Add step to existing treatment plan
        const addStepResponse = await treatmentPlansAPI.addStep(treatmentPlan.id, newStep);
        
        if (addStepResponse && addStepResponse.data && addStepResponse.data.step) {
          // Add the new step to our state
          setTreatmentSteps([...treatmentSteps, addStepResponse.data.step]);
          setNewStep('');
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error adding step:', err);
      setError('Fehler beim Hinzufügen des Schritts. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteStep = async (stepId) => {
    try {
      setLoading(true);
      
      // Call API to delete the step
      await treatmentPlansAPI.deleteStep(stepId);
      
      // Update local state
      setTreatmentSteps(treatmentSteps.filter(step => step.id !== stepId));
      setError(null);
    } catch (err) {
      console.error('Error deleting step:', err);
      setError('Fehler beim Löschen des Schritts. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateDiagnosis = async () => {
    try {
      setLoading(true);
      
      // If treatment plan doesn't exist yet, create it
      if (!treatmentPlan) {
        const createPlanResponse = await treatmentPlansAPI.create(id, {
          diagnosis
        });
        
        if (createPlanResponse && createPlanResponse.data && createPlanResponse.data.treatmentPlan) {
          setTreatmentPlan(createPlanResponse.data.treatmentPlan);
          setError(null);
        }
      } else {
        // Update existing treatment plan diagnosis
        const updateResponse = await treatmentPlansAPI.update(treatmentPlan.id, {
          diagnosis
        });
        
        if (updateResponse && updateResponse.data && updateResponse.data.treatmentPlan) {
          setTreatmentPlan(updateResponse.data.treatmentPlan);
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error updating diagnosis:', err);
      setError('Fehler beim Aktualisieren der Diagnose. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveTreatmentPlan = async () => {
    try {
      setLoading(true);
      
      // If the treatment plan already exists, just fetch it again
      // since we can't set the status field yet
      if (treatmentPlan) {
        // Reload treatment plan data
        await loadSessionData();
        setError(null);
      } else {
        // If the treatment plan doesn't exist and there are steps, create it
        if (treatmentSteps.length > 0) {
          const createResponse = await treatmentPlansAPI.create(id, {
            diagnosis,
            steps: treatmentSteps
          });
          
          if (createResponse && createResponse.data && createResponse.data.treatmentPlan) {
            setTreatmentPlan(createResponse.data.treatmentPlan);
            setError(null);
          }
        }
      }
    } catch (err) {
      console.error('Error saving treatment plan:', err);
      setError('Fehler beim Speichern des Behandlungsplans. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendTreatmentPlan = () => {
    // Open confirmation dialog before sending
    setDialogOpen(true);
  };
  
  const confirmSendTreatmentPlan = async () => {
    try {
      setLoading(true);
      setDialogOpen(false);
      
      // If the treatment plan exists, we would normally update its status to ACTIVE here
      // but since we don't have that field yet, we'll just fetch it again
      if (treatmentPlan) {
        // Reload treatment plan data
        await loadSessionData();
        setError(null);
      } else {
        // If the treatment plan doesn't exist and there are steps, create it
        if (treatmentSteps.length > 0) {
          const createResponse = await treatmentPlansAPI.create(id, {
            diagnosis,
            steps: treatmentSteps
          });
          
          if (createResponse && createResponse.data && createResponse.data.treatmentPlan) {
            setTreatmentPlan(createResponse.data.treatmentPlan);
            setError(null);
          }
        } else {
          setError('Der Behandlungsplan muss mindestens einen Schritt enthalten.');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error sending treatment plan:', err);
      setError('Fehler beim Senden des Behandlungsplans. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    loadSessionData();
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Hoch';
      case 'MEDIUM':
        return 'Mittel';
      case 'LOW':
        return 'Niedrig';
      default:
        return priority;
    }
  };
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Wartend', icon: <AccessTimeIcon />, color: 'warning' };
      case 'ACTIVE':
        return { label: 'Aktiv', icon: <CheckCircleIcon />, color: 'success' };
      case 'COMPLETED':
        return { label: 'Abgeschlossen', icon: <CheckCircleIcon />, color: 'info' };
      case 'CANCELLED':
        return { label: 'Abgebrochen', icon: <ErrorIcon />, color: 'error' };
      default:
        return { label: status || 'Unbekannt', icon: null, color: 'default' };
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatVitalSignType = (type) => {
    switch (type) {
      case 'HEART_RATE':
        return 'Herzfrequenz';
      case 'BLOOD_PRESSURE':
        return 'Blutdruck';
      case 'OXYGEN_SATURATION':
        return 'Sauerstoffsättigung';
      case 'RESPIRATORY_RATE':
        return 'Atemfrequenz';
      case 'TEMPERATURE':
        return 'Temperatur';
      case 'BLOOD_GLUCOSE':
        return 'Blutzucker';
      case 'PAIN_LEVEL':
        return 'Schmerzlevel';
      case 'CONSCIOUSNESS':
        return 'Bewusstsein';
      default:
        return type.replace(/_/g, ' ');
    }
  };
  
  const getVitalSignIcon = (type) => {
    switch (type) {
      case 'HEART_RATE':
        return <MonitorHeartIcon color="error" />;
      case 'BLOOD_PRESSURE':
        return <SpeedIcon color="primary" />;
      case 'OXYGEN_SATURATION':
        return <WaterDropIcon color="info" />;
      case 'RESPIRATORY_RATE':
        return <AirIcon color="warning" />;
      case 'TEMPERATURE':
        return <ThermostatIcon color="secondary" />;
      case 'BLOOD_GLUCOSE':
        return <BloodtypeIcon color="success" />;
      case 'PAIN_LEVEL':
        return <WarningIcon color="error" />;
      case 'CONSCIOUSNESS':
        return <VisibilityIcon color="info" />;
      default:
        return <MedicalServicesIcon color="default" />;
    }
  };
  
  const renderVitalSignsChart = () => {
    if (!session || !session.vitalSigns || session.vitalSigns.length === 0) {
      return (
        <Typography variant="body1">Keine Vitalwerte verfügbar</Typography>
      );
    }

    // Group vital signs by type
    const vitalSignsByType = {};
    
    // Sort vital signs by timestamp
    const sortedVitalSigns = [...session.vitalSigns].sort((a, b) => 
      new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
    );
    
    // Group vital signs by type
    sortedVitalSigns.forEach(sign => {
      if (!vitalSignsByType[sign.type]) {
        vitalSignsByType[sign.type] = [];
      }
      // Add formatted time for chart display
      const date = new Date(sign.timestamp || sign.createdAt);
      const formattedTime = date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      vitalSignsByType[sign.type].push({
        ...sign,
        time: formattedTime,
        value: sign.value,
        originalDate: sign.timestamp || sign.createdAt,
      });
    });

    // Create chart components for each vital sign type that has 2+ values
    return (
      <Grid container spacing={3}>
        {Object.keys(vitalSignsByType).map(type => {
          const signs = vitalSignsByType[type];
          const chartTitle = formatVitalSignType(type);
          
          // Convert values to numbers if possible for charts
          signs.forEach(sign => {
            if (type === 'BLOOD_PRESSURE' && sign.value.includes('/')) {
              const [systolic, diastolic] = sign.value.split('/');
              sign.systolic = parseInt(systolic, 10);
              sign.diastolic = parseInt(diastolic, 10);
            } else {
              // Try to parse as number, otherwise keep as is
              const numValue = parseFloat(sign.value);
              if (!isNaN(numValue)) {
                sign.numValue = numValue;
              }
            }
          });

          // Special handling for blood pressure
          if (type === 'BLOOD_PRESSURE') {
            return (
              <Grid item xs={12} md={6} key={type}>
                <Card>
                  <CardHeader title={chartTitle} />
                  <CardContent>
                    {signs.length >= 2 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={signs}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                          <ChartTooltip formatter={(value, name) => [value, name]} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="systolic"
                            stroke="#ff0000"
                            name="Systolisch"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="diastolic"
                            stroke="#0000ff"
                            name="Diastolisch"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                          Nur ein Wert verfügbar - Zeige Wert: {signs[0].value} {signs[0].unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weitere Werte werden als Graph angezeigt
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          } else {
            // All other vital signs
            return (
              <Grid item xs={12} md={6} key={type}>
                <Card>
                  <CardHeader title={chartTitle} />
                  <CardContent>
                    {signs.length >= 2 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={signs}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                          <ChartTooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="numValue"
                            stroke="#8884d8"
                            name={`${chartTitle} (${signs[0].unit || ''})`}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                          Nur ein Wert verfügbar - Zeige Wert: {signs[0].value} {signs[0].unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weitere Werte werden als Graph angezeigt
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          }
        })}
      </Grid>
    );
  };
  
  const renderPatientInfo = () => {
    if (!session) return null;
    
    // Parse patient history safely
    let patientHistory = {};
    try {
      if (session.medicalRecord && session.medicalRecord.patientHistory) {
        const history = safelyParseJSON(session.medicalRecord.patientHistory, {});
        if (typeof history === 'object') {
          patientHistory = history;
        } else {
          patientHistory = { description: history };
        }
      } else if (session.patientHistory) {
        const history = safelyParseJSON(session.patientHistory, {});
        if (typeof history === 'object') {
          patientHistory = history;
        } else {
          patientHistory = { description: history };
        }
      }
    } catch (error) {
      console.error('Failed to parse patient history:', error);
      patientHistory = { description: session.patientHistory || '' };
    }
    
    console.log("Patient history data:", patientHistory);
    
    const personalInfo = patientHistory.personalInfo || {};
    
    // Safely get patient name from different possible sources
    const patientName = personalInfo.fullName || session.title || session.patientCode || 'Nicht angegeben';
    
    // Safely get patient age and gender
    const patientAge = personalInfo.age || patientHistory.age || (session.patientCode ? parseInt(session.patientCode.split('-')[1]) : null) || 'Nicht angegeben';
    const patientGender = personalInfo.gender || patientHistory.gender || 'Nicht angegeben';
    
    // Extract symptoms - checking multiple possible locations
    let symptoms = [];
    if (Array.isArray(patientHistory.symptoms)) {
      symptoms = patientHistory.symptoms;
    } else if (patientHistory.mainSymptoms) {
      symptoms = Array.isArray(patientHistory.mainSymptoms) ? patientHistory.mainSymptoms : [patientHistory.mainSymptoms];
    } else if (session.symptoms) {
      symptoms = Array.isArray(session.symptoms) ? session.symptoms : [session.symptoms];
    }
    
    // Get latest vital signs for display
    const latestVitalSigns = [];
    const vitalSignTypes = new Set();
    
    if (session.vitalSigns && session.vitalSigns.length > 0) {
      // Sort by timestamp descending to get the most recent first
      const sortedVitalSigns = [...session.vitalSigns].sort((a, b) => 
        new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
      );
      
      // Get the most recent of each type
      sortedVitalSigns.forEach(sign => {
        if (!vitalSignTypes.has(sign.type)) {
          vitalSignTypes.add(sign.type);
          latestVitalSigns.push(sign);
        }
      });
    }
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Patienteninformationen" 
          action={
            <Chip 
              label={getPriorityLabel(session.priority)} 
              color={getPriorityColor(session.priority)}
            />
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Name</Typography>
              <Typography variant="body1">{patientName}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Alter</Typography>
              <Typography variant="body1">{typeof patientAge === 'number' ? `${patientAge} Jahre` : patientAge}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Geschlecht</Typography>
              <Typography variant="body1">{patientGender}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Session-ID</Typography>
              <Typography variant="body1">{session.patientCode || 'Unbekannt'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Erstellt am</Typography>
              <Typography variant="body1">{formatDate(session.createdAt)}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip 
                icon={getStatusInfo(session.status).icon}
                label={getStatusInfo(session.status).label}
                color={getStatusInfo(session.status).color}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Medic</Typography>
              <Typography variant="body1">{session.createdBy?.firstName ? `${session.createdBy.firstName} ${session.createdBy.lastName}` : 'Nicht zugewiesen'}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Symptome</Typography>
              {symptoms.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {symptoms.map((symptom, index) => (
                    <Chip key={index} label={symptom} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body1">Keine Symptome angegeben</Typography>
              )}
            </Grid>
            
            {/* Vital signs in patient info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Aktuelle Vitalwerte</Typography>
              
              {latestVitalSigns.length > 0 ? (
                <Grid container spacing={1}>
                  {latestVitalSigns.map((sign) => (
                    <Grid item xs={12} sm={6} md={3} key={sign.id}>
                      <Paper 
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          bgcolor: 'background.default'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          {getVitalSignIcon(sign.type)}
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {formatVitalSignType(sign.type)}
                          </Typography>
                        </Box>
                        <Typography variant="h6">
                          {sign.value} {sign.unit}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1">Keine Vitalwerte verfügbar</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderMedicalRecord = () => {
    if (!session || !session.medicalRecord) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Medizinische Anamnese" />
          <Divider />
          <CardContent>
            <Typography variant="body1">Keine Anamnese verfügbar</Typography>
          </CardContent>
        </Card>
      );
    }
    
    const { medicalRecord } = session;
    let patientHistory = medicalRecord.patientHistory || {};
    
    // Handle string vs object conversion
    if (typeof patientHistory === 'string') {
      try {
        // Make sure it's a non-empty string that looks like JSON
        if (patientHistory.trim() && (patientHistory.trim().startsWith('{') || patientHistory.trim().startsWith('['))) {
          patientHistory = JSON.parse(patientHistory);
        } else {
          console.log('Patient history is not valid JSON, using as plain text');
          patientHistory = { description: patientHistory };
        }
      } catch (e) {
        console.error('Failed to parse patient history:', e);
        patientHistory = { description: patientHistory };
      }
    }
    
    const personalInfo = patientHistory.personalInfo || {};
    
    // Extract symptoms - checking multiple possible locations
    let symptoms = [];
    if (Array.isArray(patientHistory.symptoms)) {
      symptoms = patientHistory.symptoms;
    } else if (patientHistory.mainSymptoms) {
      symptoms = Array.isArray(patientHistory.mainSymptoms) ? patientHistory.mainSymptoms : [patientHistory.mainSymptoms];
    } else if (session.symptoms) {
      symptoms = Array.isArray(session.symptoms) ? session.symptoms : [session.symptoms];
    }
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Medizinische Anamnese" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Persönliche Informationen</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">
                    {personalInfo.fullName || session.title || 'Nicht angegeben'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Alter</Typography>
                  <Typography variant="body1">
                    {personalInfo.age ? `${personalInfo.age} Jahre` : (session.patientCode ? `${parseInt(session.patientCode.split('-')[1])} Jahre` : 'Nicht angegeben')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Geschlecht</Typography>
                  <Typography variant="body1">
                    {personalInfo.gender || patientHistory.gender || 'Nicht angegeben'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Symptoms */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Symptome</Typography>
              <Grid container spacing={1}>
                {symptoms.length > 0 ? (
                  symptoms.map((symptom, index) => (
                    <Grid item key={index}>
                      <Chip label={symptom} color="primary" variant="outlined" />
                    </Grid>
                  ))
                ) : (
                  <Grid item>
                    <Typography variant="body1">Keine Symptome angegeben</Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            
            {/* Onset */}
            {patientHistory.onset && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Beginn der Symptome</Typography>
                <Typography variant="body1">{patientHistory.onset}</Typography>
              </Grid>
            )}
            
            {/* Description */}
            {patientHistory.description && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Beschreibung</Typography>
                <Typography variant="body1">{patientHistory.description}</Typography>
              </Grid>
            )}
            
            {/* Current Medications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Aktuelle Medikation</Typography>
              <Typography variant="body1">
                {medicalRecord.currentMedications || 'Keine Angaben'}
              </Typography>
            </Grid>
            
            {/* Allergies */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Allergien</Typography>
              <Typography variant="body1">
                {medicalRecord.allergies || 'Keine Allergien bekannt'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Determine the treatment plan status with a fallback
  const getTreatmentPlanStatus = (plan) => {
    // If we have a treatment plan with a status field, use it
    if (plan && plan.status) {
      return plan.status;
    }
    
    // Otherwise, assume it's a draft for now
    return 'DRAFT';
  };
  
  const renderTreatmentPlan = () => {
    const planStatus = getTreatmentPlanStatus(treatmentPlan);
    const isPlanActive = planStatus === 'ACTIVE';
    const isPlanCompleted = planStatus === 'COMPLETED';
    const isPlanEditable = !isPlanActive && !isPlanCompleted;
    
    return (
      <Card>
        <CardHeader 
          title="Behandlungsplan" 
          subheader={treatmentPlan ? `Status: ${planStatus}` : 'Kein Plan vorhanden'}
          action={
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Diagnose"
            variant="outlined"
            fullWidth
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            disabled={!isPlanEditable}
            margin="normal"
            onBlur={handleUpdateDiagnosis}
          />
          
          <Divider sx={{ my: 2 }} />
          
          {/* Treatment Steps */}
          <Typography variant="h6" gutterBottom>
            Behandlungsschritte
          </Typography>
          
          {treatmentSteps.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Noch keine Behandlungsschritte hinzugefügt.
            </Alert>
          ) : (
            <List>
              {treatmentSteps.map((step, index) => (
                <ListItem 
                  key={step.id} 
                  secondaryAction={
                    isPlanEditable && (
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteStep(step.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon>
                    {step.status === 'COMPLETED' ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        {index + 1}.
                      </Typography>
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={step.description} 
                    secondary={step.completedAt ? `Abgeschlossen am: ${formatDate(step.completedAt)}` : null}
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {/* Add New Step */}
          {isPlanEditable && (
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                label="Neuer Behandlungsschritt"
                variant="outlined"
                fullWidth
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddStep}
                disabled={loading || newStep.trim() === ''}
                sx={{ ml: 1 }}
                startIcon={<AddIcon />}
              >
                Hinzufügen
              </Button>
            </Box>
          )}
          
          {/* Action Buttons */}
          {!loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {isPlanEditable && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleSaveTreatmentPlan}
                    disabled={loading || treatmentSteps.length === 0}
                    sx={{ mr: 1 }}
                    startIcon={<SaveIcon />}
                  >
                    Speichern
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendTreatmentPlan}
                    disabled={loading || treatmentSteps.length === 0}
                    startIcon={<SendIcon />}
                  >
                    An Medic senden
                  </Button>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Confirmation Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          >
            <DialogTitle>Behandlungsplan senden</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Sind Sie sicher, dass Sie den Behandlungsplan an den Medic senden möchten? 
                Nach dem Senden kann der Plan nicht mehr geändert werden.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="primary">
                Abbrechen
              </Button>
              <Button onClick={confirmSendTreatmentPlan} color="primary" variant="contained">
                Senden
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  // Accept the session
  const handleAcceptSession = async () => {
    try {
      setActionLoading(true);
      
      // Assign session to current doctor
      const result = await sessionsAPI.assign(id);
      
      if (result) {
        setSuccessMessage('Session erfolgreich übernommen');
        
        // Reload session data
        await loadSessionData();
        
        // Load or create treatment plan
        await loadTreatmentPlan();
      }
    } catch (err) {
      console.error('Error accepting session:', err);
      setError('Fehler beim Übernehmen der Session');
    } finally {
      setActionLoading(false);
    }
  };

  // Complete the session
  const handleCompleteSession = async () => {
    if (!session) return;
    
    try {
      setActionLoading(true);
      
      // First make sure the session is in IN_PROGRESS status
      if (session.status !== 'IN_PROGRESS') {
        // Update to IN_PROGRESS first
        await sessionsAPI.update(id, { status: 'IN_PROGRESS' });
        
        // Short delay to ensure the update is processed
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Now complete the session
      const response = await sessionsAPI.update(id, { status: 'COMPLETED' });
      if (response) {
        setSuccessMessage('Die Session wurde erfolgreich abgeschlossen');
        
        // Reload session data after a short delay to ensure backend has updated
        setTimeout(() => {
          loadSessionData();
        }, 1000);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      setError('Fehler beim Abschließen der Session');
    } finally {
      setActionLoading(false);
    }
  };

  // Add this after session data loading function
  const loadTreatmentPlan = async () => {
    if (!session?.id || user?.role !== 'DOCTOR') return;

    try {
      const response = await treatmentPlansAPI.getBySessionId(session.id);
      if (response.treatmentPlan) {
        setTreatmentPlan(response.treatmentPlan);
      } else if (session.status !== 'OPEN' && session.assignedToId === user.id) {
        // Create a new draft treatment plan if one doesn't exist
        try {
          const createResponse = await treatmentPlansAPI.create({
            sessionId: session.id,
            diagnosis: '',
            treatment: '',
            medications: [],
            notes: '',
            status: 'DRAFT'
          });
          
          if (createResponse.treatmentPlan) {
            setTreatmentPlan(createResponse.treatmentPlan);
          }
        } catch (createError) {
          console.error('Error creating treatment plan:', createError);
        }
      }
    } catch (error) {
      console.error('Error loading treatment plan:', error);
      // Don't show error for 404s since we handle that case above
      if (error.response?.status !== 404) {
        setError('Fehler beim Laden des Behandlungsplans');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/doctor/sessions')} 
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Session Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ mr: 1 }}
        >
          Aktualisieren
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : successMessage ? (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {successMessage}
        </Alert>
      ) : null}
      
      {session && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {session.title || 'Unbetitelte Session'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Session-ID: {session.patientCode || 'Unbekannt'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Erstellt am: {formatDate(session.createdAt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={getStatusInfo(session.status).label}
                      color={getStatusInfo(session.status).color}
                      icon={getStatusInfo(session.status).icon}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={getPriorityLabel(session.priority)}
                      color={getPriorityColor(session.priority)}
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />

                {session.status === 'OPEN' && (
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAcceptSession}
                      disabled={actionLoading}
                      startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    >
                      Session annehmen
                    </Button>
                  </Box>
                )}

                {session.status === 'IN_PROGRESS' && (
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleCompleteSession}
                      disabled={actionLoading}
                      startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    >
                      Session abschließen
                    </Button>
                  </Box>
                )}
                
                <Box sx={{ my: 3 }}>
                  <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="Patienteninformationen" />
                    <Tab label="Vitalwerte" />
                    <Tab label="Behandlungsplan" />
                  </Tabs>
                  
                  {tabValue === 0 && (
                    <>
                      {renderPatientInfo()}
                      {renderMedicalRecord()}
                    </>
                  )}
                  {tabValue === 1 && renderVitalSignsChart()}
                  {tabValue === 2 && renderTreatmentPlan()}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aktionen
                </Typography>
                <List>
                  <ListItem>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      color="primary" 
                      startIcon={<RefreshIcon />}
                      onClick={handleRefresh}
                    >
                      Daten aktualisieren
                    </Button>
                  </ListItem>
                  {session.status === 'ASSIGNED' && (
                    <ListItem>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        color="success" 
                        startIcon={<CheckCircleIcon />} 
                        onClick={() => sessionsAPI.update(session.id, { status: 'IN_PROGRESS' }).then(handleRefresh)}
                      >
                        Session starten
                      </Button>
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SessionDetail; 