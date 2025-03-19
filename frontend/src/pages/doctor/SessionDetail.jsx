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
  Send as SendIcon
} from '@mui/icons-material';
import { sessionsAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [newStep, setNewStep] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch session data
  useEffect(() => {
    if (id) {
      loadSessionData();
    }
  }, [id]);
  
  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, fetch from API
      const response = await sessionsAPI.getById(id);
      
      if (response && response.data) {
        setSession(response.data);
        
        // If the session has a treatment plan, load it
        if (response.data.treatmentPlan) {
          setTreatmentPlan(response.data.treatmentPlan.steps || []);
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Fehler beim Laden der Session-Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAddStep = () => {
    if (newStep.trim() === '') return;
    
    setTreatmentPlan([...treatmentPlan, { 
      id: Date.now().toString(), 
      description: newStep,
      completed: false 
    }]);
    setNewStep('');
  };
  
  const handleDeleteStep = (stepId) => {
    setTreatmentPlan(treatmentPlan.filter(step => step.id !== stepId));
  };
  
  const handleSaveTreatmentPlan = async () => {
    try {
      setLoading(true);
      
      // Call API to save treatment plan
      await sessionsAPI.update(id, { 
        treatmentPlan: { 
          steps: treatmentPlan,
          status: 'DRAFT'
        } 
      });
      
      // Reload session data
      await loadSessionData();
      
      setError(null);
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
      
      // Call API to send treatment plan
      await sessionsAPI.update(id, { 
        treatmentPlan: { 
          steps: treatmentPlan,
          status: 'ACTIVE'
        } 
      });
      
      // Reload session data
      await loadSessionData();
      
      setError(null);
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
  
  const renderMockVitalsChart = () => {
    // Mock data for vital signs
    const mockHeartRateData = [
      { time: '10:00', value: 75 },
      { time: '10:15', value: 78 },
      { time: '10:30', value: 80 },
      { time: '10:45', value: 82 },
      { time: '11:00', value: 79 },
      { time: '11:15', value: 77 },
      { time: '11:30', value: 75 },
    ];
    
    const mockBloodPressureData = [
      { time: '10:00', systolic: 120, diastolic: 80 },
      { time: '10:15', systolic: 122, diastolic: 82 },
      { time: '10:30', systolic: 125, diastolic: 85 },
      { time: '10:45', systolic: 128, diastolic: 87 },
      { time: '11:00', systolic: 126, diastolic: 84 },
      { time: '11:15', systolic: 124, diastolic: 82 },
      { time: '11:30', systolic: 122, diastolic: 80 },
    ];
    
    const mockOxygenData = [
      { time: '10:00', value: 98 },
      { time: '10:15', value: 97 },
      { time: '10:30', value: 97 },
      { time: '10:45', value: 96 },
      { time: '11:00', value: 96 },
      { time: '11:15', value: 97 },
      { time: '11:30', value: 98 },
    ];
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Herzfrequenz" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockHeartRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[60, 100]} />
                  <ChartTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name="Puls (BPM)"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Blutdruck" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockBloodPressureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[40, 180]} />
                  <ChartTooltip />
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
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Sauerstoffsättigung" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockOxygenData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[90, 100]} />
                  <ChartTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    name="SpO₂ (%)"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  const renderPatientInfo = () => {
    if (!session) return null;
    
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
              <Typography variant="body1">{session.patientName || 'Nicht angegeben'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Alter</Typography>
              <Typography variant="body1">{session.age ? `${session.age} Jahre` : 'Nicht angegeben'}</Typography>
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
              <Typography variant="body1">{session.medic?.name || 'Nicht zugewiesen'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="text.secondary">Zugewiesen an</Typography>
              <Typography variant="body1">{session.assignedTo || 'Nicht zugewiesen'}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Symptome</Typography>
              <Typography variant="body1">
                {session.symptoms?.join(', ') || 'Keine Symptome angegeben'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderTreatmentPlan = () => {
    const canEditTreatmentPlan = !session?.treatmentPlan || session?.treatmentPlan?.status === 'DRAFT';
    const canSendTreatmentPlan = treatmentPlan.length > 0 && canEditTreatmentPlan;
    
    return (
      <Card>
        <CardHeader 
          title="Behandlungsplan" 
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {canEditTreatmentPlan && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleSaveTreatmentPlan}
                  startIcon={<SaveIcon />}
                  disabled={loading || treatmentPlan.length === 0}
                >
                  Speichern
                </Button>
              )}
              
              {canSendTreatmentPlan && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendTreatmentPlan}
                  startIcon={<SendIcon />}
                  disabled={loading || treatmentPlan.length === 0}
                >
                  An Medic senden
                </Button>
              )}
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {session?.treatmentPlan?.status === 'ACTIVE' ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Dieser Behandlungsplan wurde bereits an den Medic gesendet und kann nicht mehr bearbeitet werden.
              </Alert>
              
              <Stepper orientation="vertical" activeStep={-1}>
                {treatmentPlan.map((step, index) => (
                  <Step key={step.id} active={true}>
                    <StepLabel>
                      <Typography variant="body1">{step.description}</Typography>
                      {step.completed && (
                        <Typography variant="caption" color="success.main">
                          Abgeschlossen am {formatDate(step.completedAt)}
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          ) : treatmentPlan.length === 0 ? (
            <Alert severity="info">
              Erstellen Sie einen Behandlungsplan für diesen Patienten mit klaren, kurzen Anweisungen.
            </Alert>
          ) : (
            <Box>
              <List>
                {treatmentPlan.map((step, index) => (
                  <ListItem
                    key={step.id}
                    secondaryAction={
                      canEditTreatmentPlan && (
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleDeleteStep(step.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemIcon>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 25 }}>
                        {index + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={step.description} />
                  </ListItem>
                ))}
              </List>
              
              {canEditTreatmentPlan && (
                <Box sx={{ display: 'flex', mt: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Neuer Behandlungsschritt"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    placeholder="Schrittweise Anweisung eingeben..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddStep();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddStep}
                    startIcon={<AddIcon />}
                    sx={{ ml: 1 }}
                    disabled={newStep.trim() === ''}
                  >
                    Hinzufügen
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderVitalSigns = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Vitalwerte</Typography>
        {renderMockVitalsChart()}
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton color="primary" onClick={() => navigate('/doctor/sessions')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Session {id}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !session ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : !session ? (
        <Alert severity="error">
          Session nicht gefunden. Möglicherweise wurde sie gelöscht oder Sie haben nicht die erforderlichen Berechtigungen.
        </Alert>
      ) : (
        <Box>
          {renderPatientInfo()}
          
          <Box sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Behandlungsplan" />
              <Tab label="Vitalwerte" />
            </Tabs>
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              {tabValue === 0 ? (
                renderTreatmentPlan()
              ) : (
                renderVitalSigns()
              )}
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Behandlungsplan senden</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie den Behandlungsplan an den Medic senden möchten? 
            Nach dem Senden kann der Plan nicht mehr bearbeitet werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={confirmSendTreatmentPlan} color="primary" autoFocus>
            Senden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionDetail; 