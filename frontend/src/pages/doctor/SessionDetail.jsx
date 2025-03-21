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
import { sessionsAPI, treatmentPlansAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

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
  
  // Fetch session data
  useEffect(() => {
    if (id) {
      loadSessionData();
    }
  }, [id]);
  
  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      // Fetch session data
      const sessionResponse = await sessionsAPI.getById(id);
      
      if (sessionResponse && sessionResponse.data) {
        setSession(sessionResponse.data);
        
        // Try to load treatment plan for this session
        try {
          const treatmentResponse = await treatmentPlansAPI.getBySessionId(id);
          
          if (treatmentResponse && treatmentResponse.data && treatmentResponse.data.treatmentPlan) {
            const plan = treatmentResponse.data.treatmentPlan;
            setTreatmentPlan(plan);
            setTreatmentSteps(plan.steps || []);
            setDiagnosis(plan.diagnosis || '');
          }
        } catch (treatmentError) {
          // Treatment plan may not exist yet, that's ok
          console.log('No treatment plan found, may need to create one');
          setTreatmentPlan(null);
          setTreatmentSteps([]);
          setDiagnosis('');
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
  
  const renderVitalSigns = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Vitalwerte</Typography>
        {renderMockVitalsChart()}
      </Box>
    );
  };

  // Accept the session
  const handleAcceptSession = async () => {
    if (!session) return;
    
    try {
      setActionLoading(true);
      
      // Update session status to IN_PROGRESS
      await sessionsAPI.update(id, { status: 'IN_PROGRESS' });
      
      // Show success message
      setSuccessMessage('Session erfolgreich angenommen');
      
      // Reload the session data to get updated status
      await loadSessionData();
    } catch (err) {
      console.error('Error accepting session:', err);
      setError('Fehler beim Annehmen der Session. Bitte versuchen Sie es später erneut.');
    } finally {
      setActionLoading(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  // Complete the session
  const handleCompleteSession = async () => {
    if (!session) return;
    
    try {
      setActionLoading(true);
      
      // Update session status to COMPLETED
      await sessionsAPI.update(id, { status: 'COMPLETED' });
      
      // Show success message
      setSuccessMessage('Session erfolgreich abgeschlossen');
      
      // Reload the session data to get updated status
      await loadSessionData();
    } catch (err) {
      console.error('Error completing session:', err);
      setError('Fehler beim Abschließen der Session. Bitte versuchen Sie es später erneut.');
    } finally {
      setActionLoading(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
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
                      Patient ID: {session.patientCode || 'Unbekannt'}
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
                  
                  {tabValue === 0 && renderPatientInfo()}
                  {tabValue === 1 && renderVitalSigns()}
                  {tabValue === 2 && renderTreatmentPlan()}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Vitalwerte (aktuelle)
                </Typography>
                <List>
                  {session.vitalSigns && session.vitalSigns.length > 0 ? (
                    session.vitalSigns
                      .filter((sign, index, self) => {
                        // Get the first occurrence of each vital sign type
                        return index === self.findIndex(s => s.type === sign.type);
                      })
                      .map((sign) => (
                        <ListItem key={sign.id} sx={{ py: 1 }}>
                          <ListItemIcon>
                            {sign.type === 'HEART_RATE' && <MedicalServicesIcon color="error" />}
                            {sign.type === 'BLOOD_PRESSURE' && <MedicalServicesIcon color="primary" />}
                            {sign.type === 'OXYGEN_SATURATION' && <MedicalServicesIcon color="info" />}
                            {sign.type === 'RESPIRATORY_RATE' && <MedicalServicesIcon color="warning" />}
                            {sign.type === 'TEMPERATURE' && <MedicalServicesIcon color="secondary" />}
                            {sign.type === 'BLOOD_GLUCOSE' && <MedicalServicesIcon color="success" />}
                            {sign.type === 'PAIN_LEVEL' && <MedicalServicesIcon color="error" />}
                            {sign.type === 'CONSCIOUSNESS' && <MedicalServicesIcon color="info" />}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${sign.type.replace(/_/g, ' ')}`}
                            secondary={`${sign.value} ${sign.unit}`}
                          />
                        </ListItem>
                      ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="Keine Vitalwerte verfügbar" />
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