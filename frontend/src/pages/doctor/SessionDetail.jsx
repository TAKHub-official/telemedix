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
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Thermostat as ThermostatIcon,
  MonitorHeart as MonitorHeartIcon,
  Bloodtype as BloodtypeIcon,
  Air as AirIcon,
  WaterDrop as WaterDropIcon,
  Speed as SpeedIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { sessionsAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { SESSION_COMPLETION_REASONS } from '../../constants';

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
  const [tabValue, setTabValue] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [user, setUser] = useState(null);
  
  // Add states for the completion dialog
  const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
  const [completionReason, setCompletionReason] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [isOtherReason, setIsOtherReason] = useState(false);
  
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
  
  const handleRefresh = () => {
    loadSessionData();
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'NORMAL':
        return 'info';
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
      case 'NORMAL':
        return 'Normal';
      case 'LOW':
        return 'Niedrig';
      default:
        return priority;
    }
  };
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'OPEN':
        return { label: 'Offen', icon: <AccessTimeIcon />, color: 'warning' };
      case 'ASSIGNED':
        return { label: 'Zugewiesen', icon: <CheckCircleIcon />, color: 'info' };
      case 'IN_PROGRESS':
        return { label: 'In Bearbeitung', icon: <CheckCircleIcon />, color: 'primary' };
      case 'COMPLETED':
        return { label: 'Abgeschlossen', icon: <CheckCircleIcon />, color: 'success' };
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
  
  const getVitalSignIcon = (type) => {
    switch (type) {
      case 'TEMPERATURE':
        return <ThermostatIcon color="error" />;
      case 'HEART_RATE':
        return <MonitorHeartIcon color="error" />;
      case 'BLOOD_PRESSURE':
        return <BloodtypeIcon color="error" />;
      case 'OXYGEN_SATURATION':
        return <AirIcon color="primary" />;
      case 'RESPIRATORY_RATE':
        return <SpeedIcon color="primary" />;
      case 'HYDRATION':
        return <WaterDropIcon color="primary" />;
      case 'BLOOD_GLUCOSE':
        return <BloodtypeIcon color="success" />;
      case 'PAIN_LEVEL':
        return <ErrorIcon color="error" />;
      case 'CONSCIOUSNESS':
        return <AccessTimeIcon color="info" />;
      default:
        return null;
    }
  };
  
  const formatVitalSignType = (type) => {
    switch (type) {
      case 'TEMPERATURE':
        return 'Temperatur';
      case 'HEART_RATE':
        return 'Herzfrequenz';
      case 'BLOOD_PRESSURE':
        return 'Blutdruck';
      case 'OXYGEN_SATURATION':
        return 'Sauerstoffsättigung';
      case 'RESPIRATORY_RATE':
        return 'Atemfrequenz';
      case 'HYDRATION':
        return 'Flüssigkeitshaushalt';
      case 'BLOOD_GLUCOSE':
        return 'Blutzucker';
      case 'PAIN_LEVEL':
        return 'Schmerzlevel';
      case 'CONSCIOUSNESS':
        return 'Bewusstsein';
      default:
        return type;
    }
  };
  
  const renderVitalSignsChart = () => {
    if (!session || !session.vitalSigns || session.vitalSigns.length === 0) {
      return (
        <Card>
          <CardHeader title="Vitalwerte" />
          <Divider />
          <CardContent>
            <Typography variant="body1">Keine Vitalwerte verfügbar</Typography>
          </CardContent>
        </Card>
      );
    }
    
    // Group vital signs by type
    const vitalSignsByType = {};
    session.vitalSigns.forEach(sign => {
      if (!vitalSignsByType[sign.type]) {
        vitalSignsByType[sign.type] = [];
      }
      vitalSignsByType[sign.type].push({
        ...sign,
        time: formatDate(sign.timestamp || sign.createdAt)
      });
    });
    
    // Sort each group of vital signs by timestamp (oldest first)
    Object.keys(vitalSignsByType).forEach(type => {
      vitalSignsByType[type].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt);
        const dateB = new Date(b.timestamp || b.createdAt);
        return dateA - dateB;
      });
    });
    
    return (
      <Grid container spacing={3}>
        {Object.entries(vitalSignsByType).map(([type, signs]) => {
          const chartTitle = formatVitalSignType(type);
          
          // Process data for charting
          signs.forEach(sign => {
            // Special handling for blood pressure
            if (type === 'BLOOD_PRESSURE' && sign.value) {
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
          } else if (type === 'CONSCIOUSNESS') {
            // Spezielle Darstellung für Bewusstseinszustand
            return (
              <Grid item xs={12} md={6} key={type}>
                <Card>
                  <CardHeader title={chartTitle} />
                  <CardContent>
                    {signs.length > 0 ? (
                      <>
                        <Typography variant="body2" gutterBottom>
                          Zeitlicher Verlauf des Bewusstseinszustands:
                        </Typography>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                          <Box sx={{ minWidth: signs.length * 70, mt: 2 }}>
                            {signs.map((sign, index) => {
                              // Farbkodierung für Bewusstseinszustände
                              const getColor = (value) => {
                                switch(value) {
                                  case 'A': 
                                  case 'ALERT': return '#4caf50'; // Grün für Alert
                                  case 'V': 
                                  case 'VERBAL': return '#2196f3'; // Blau für Verbal
                                  case 'P': 
                                  case 'PAIN': return '#ff9800'; // Orange für Pain
                                  case 'U': 
                                  case 'UNRESPONSIVE': return '#f44336'; // Rot für Unresponsive
                                  default: return '#9e9e9e'; // Grau für unbekannt
                                }
                              };
                              
                              return (
                                <Box 
                                  key={index} 
                                  sx={{ 
                                    display: 'inline-block', 
                                    textAlign: 'center',
                                    m: 0.5,
                                    verticalAlign: 'top',
                                    width: 80
                                  }}
                                >
                                  <Paper
                                    elevation={3}
                                    sx={{
                                      p: 1,
                                      bgcolor: getColor(sign.value || ''),
                                      color: 'white',
                                      width: 70,
                                      height: 70,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      fontSize: '24px',
                                      mx: 'auto'
                                    }}
                                  >
                                    {sign.value === 'ALERT' ? 'A' : 
                                     sign.value === 'VERBAL' ? 'V' : 
                                     sign.value === 'PAIN' ? 'P' : 
                                     sign.value === 'UNRESPONSIVE' ? 'U' : 
                                     sign.value || '?'}
                                  </Paper>
                                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                    {sign.time}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                          Keine Bewusstseinsdaten verfügbar
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
    
    // Standardize the gender format - always use 'Männlich' or 'Weiblich'
    let patientGender = personalInfo.gender || patientHistory.gender || 'Nicht angegeben';
    if (patientGender === 'MALE') patientGender = 'Männlich';
    if (patientGender === 'FEMALE') patientGender = 'Weiblich';
    
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
            
            {/* Show completion reason only if status is COMPLETED */}
            {session.status === 'COMPLETED' && session.completionReason && (
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Abschlussgrund</Typography>
                <Typography variant="body1">
                  {SESSION_COMPLETION_REASONS.find(r => r.value === session.completionReason)?.label || session.completionReason}
                </Typography>
                {session.completionNote && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {session.completionNote}
                  </Typography>
                )}
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Medic</Typography>
              <Typography variant="body1">{session.createdBy?.firstName ? `${session.createdBy.firstName} ${session.createdBy.lastName}` : 'Nicht zugewiesen'}</Typography>
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
    
    // Extract fields with extra null checks
    const mainComplaint = patientHistory.chiefComplaint || 'Nicht angegeben';
    const pastMedicalHistory = patientHistory.pastMedicalHistory || 'Nicht angegeben';
    const currentMedications = medicalRecord.currentMedications || 'Keine angegeben';
    const allergies = medicalRecord.allergies || 'Keine bekannt';
    const description = patientHistory.incidentDescription || patientHistory.description || 'Keine Beschreibung vorhanden';
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Medizinische Anamnese" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Hauptbeschwerde</Typography>
              <Typography variant="body1">{mainComplaint}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Beschreibung</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{description}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Vorerkrankungen</Typography>
              <Typography variant="body1">{pastMedicalHistory}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Aktuelle Medikation</Typography>
              <Typography variant="body1">{currentMedications}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Allergien</Typography>
              <Typography variant="body1">{allergies}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Accept the session and immediately set it to IN_PROGRESS
  const handleAcceptSession = async () => {
    try {
      setActionLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Starting session accept process for ID:', id);
      
      // First, set local state to show UI changes immediately
      setSession(prevState => ({
        ...prevState,
        status: 'ASSIGNED',
        assignedToId: user?.id
      }));
      
      // Assign session to current doctor
      console.log('Assigning session to doctor...');
      const assignResult = await sessionsAPI.assign(id);
      console.log('Session assign result:', assignResult);
      
      // Update UI again after the first API call
      setSession(prevState => ({
        ...prevState,
        status: 'ASSIGNED',
        assignedToId: user?.id
      }));
      
      if (assignResult) {
        // Immediately set status to IN_PROGRESS (skip ASSIGNED state)
        console.log('Updating session status to IN_PROGRESS...');
        const updateResult = await sessionsAPI.update(id, { status: 'IN_PROGRESS' });
        console.log('Session update result:', updateResult);
        
        // Final UI update with IN_PROGRESS status
        setSession(prevState => ({
          ...prevState,
          status: 'IN_PROGRESS',
          assignedToId: user?.id
        }));
        
        if (updateResult) {
          setSuccessMessage('Session erfolgreich übernommen und gestartet');
          
          // Add a small delay before reloading data to ensure backend changes are processed
          console.log('Waiting before reloading session data...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Final data refresh to ensure all data is up to date
          console.log('Reloading session data...');
          await loadSessionData();
        }
      }
    } catch (err) {
      console.error('Error accepting session:', err);
      setError('Fehler beim Übernehmen der Session');
      
      // Reload data in case of error to reset UI
      await loadSessionData();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle opening the completion dialog
  const handleOpenCompletionDialog = () => {
    setCompletionReason('');
    setCompletionNote('');
    setIsOtherReason(false);
    setOpenCompletionDialog(true);
  };
  
  // Handle closing the completion dialog
  const handleCloseCompletionDialog = () => {
    setOpenCompletionDialog(false);
  };
  
  // Handle completion reason change
  const handleCompletionReasonChange = (event) => {
    const value = event.target.value;
    setCompletionReason(value);
    setIsOtherReason(value === 'OTHER');
  };
  
  // Complete the session with reason
  const handleCompleteSessionWithReason = async () => {
    if (!session || !completionReason) return;
    
    try {
      setActionLoading(true);
      setError(null); // Clear any previous errors
      handleCloseCompletionDialog();
      
      console.log('Starting session completion process for ID:', id);
      console.log('Completion reason:', completionReason);
      console.log('Completion note:', completionNote);
      
      // Prepare update data including the completion reason
      const updateData = {
        status: 'COMPLETED',
        completionReason: completionReason,
        completionNote: isOtherReason ? completionNote : ''
      };
      
      // Update UI immediately to show status change
      setSession(prevState => ({
        ...prevState,
        status: 'COMPLETED',
        completionReason: completionReason,
        completionNote: isOtherReason ? completionNote : ''
      }));
      
      // Complete the session
      console.log('Updating session status to COMPLETED with reason...');
      try {
        const response = await sessionsAPI.update(id, updateData);
        console.log('Session complete result:', response);
        
        if (response) {
          setSuccessMessage('Die Session wurde erfolgreich abgeschlossen');
          
          // Update UI again after API call
          setSession(prevState => ({
            ...prevState,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            completionReason: completionReason,
            completionNote: isOtherReason ? completionNote : ''
          }));
          
          // Add a small delay before reloading data to ensure backend has updated
          console.log('Waiting before reloading session data...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Final data refresh
          console.log('Reloading session data...');
          await loadSessionData();
        } else {
          console.error('No response received from update API call');
          setError('Fehler beim Abschließen der Session: Keine Antwort vom Server');
          await loadSessionData();
        }
      } catch (apiError) {
        console.error('API call error:', apiError);
        setError(`Fehler beim Abschließen der Session: ${apiError.message || 'Unbekannter Fehler'}`);
        await loadSessionData();
      }
    } catch (error) {
      console.error('Error completing session:', error);
      setError('Fehler beim Abschließen der Session');
      
      // Reload data in case of error to reset UI
      await loadSessionData();
    } finally {
      setActionLoading(false);
    }
  };

  // Replace the original handleCompleteSession
  const handleCompleteSession = () => {
    handleOpenCompletionDialog();
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

            {/* Show accept button only if status is OPEN */}
            {session.status === 'OPEN' && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAcceptSession}
                  disabled={actionLoading}
                  startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  Session annehmen und starten
                </Button>
              </Box>
            )}

            {/* Show complete button only if status is IN_PROGRESS */}
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
              </Tabs>
              
              {tabValue === 0 && (
                <>
                  {renderPatientInfo()}
                  {renderMedicalRecord()}
                </>
              )}
              {tabValue === 1 && renderVitalSignsChart()}
            </Box>
          </Paper>
        </>
      )}

      {/* Session Completion Dialog */}
      <Dialog open={openCompletionDialog} onClose={handleCloseCompletionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Session abschließen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bitte wählen Sie einen Grund für den Abschluss dieser Session:
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="completion-reason-label">Abschlussgrund</InputLabel>
            <Select
              labelId="completion-reason-label"
              value={completionReason}
              onChange={handleCompletionReasonChange}
              label="Abschlussgrund"
              required
            >
              {SESSION_COMPLETION_REASONS.map((reason) => (
                <MenuItem key={reason.value} value={reason.value}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {isOtherReason && (
            <TextField
              fullWidth
              margin="normal"
              label="Sonstiger Grund (bitte spezifizieren)"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              multiline
              rows={3}
              required
              placeholder="Bitte geben Sie den Grund an, warum die Session abgeschlossen wird..."
            />
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Hinweis: Nach dem Abschließen wird diese Session archiviert und kann nicht mehr bearbeitet werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompletionDialog} color="inherit">
            Abbrechen
          </Button>
          <Button 
            onClick={handleCompleteSessionWithReason} 
            color="success" 
            variant="contained"
            disabled={!completionReason || (isOtherReason && !completionNote)}
          >
            Session abschließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionDetail; 