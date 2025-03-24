import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { sessionsAPI } from '../../services/api';

const TreatmentTemplatePlayer = ({ sessionId, onTreatmentStatusChange }) => {
  const [sessionTreatmentTemplate, setSessionTreatmentTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPlayer, setOpenPlayer] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [treatmentSteps, setTreatmentSteps] = useState([]);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Fetch session treatment template
  useEffect(() => {
    fetchSessionTreatmentTemplate();
  }, [sessionId]);

  const fetchSessionTreatmentTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionsAPI.getSessionTreatmentTemplate(sessionId);
      const template = response.data.sessionTreatmentTemplate;
      
      setSessionTreatmentTemplate(template);
      
      // Parse steps from JSON if needed
      const steps = typeof template.treatmentTemplate.steps === 'string'
        ? JSON.parse(template.treatmentTemplate.steps)
        : template.treatmentTemplate.steps;
        
      setTreatmentSteps(steps);
      
      // Set current step from saved progress
      setCurrentStep(template.currentStep);
      
      // Check if treatment is already completed
      setCompleted(template.status === 'COMPLETED');
      
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No template assigned - this is expected for new sessions
        setSessionTreatmentTemplate(null);
      } else {
        console.error('Error fetching session treatment template:', err);
        setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Start the treatment
  const handleStartTreatment = async () => {
    try {
      setUpdatingProgress(true);
      
      // Only update if not already started
      if (sessionTreatmentTemplate.status === 'NEW') {
        await sessionsAPI.updateTreatmentProgress(sessionId, {
          status: 'IN_PROGRESS',
          currentStep: 0
        });
      }
      
      // Refresh data
      await fetchSessionTreatmentTemplate();
      
      // Notify parent component if provided
      if (onTreatmentStatusChange) {
        onTreatmentStatusChange('IN_PROGRESS');
      }
      
      // Open the player
      setOpenPlayer(true);
      
    } catch (err) {
      console.error('Error starting treatment:', err);
      setError('Fehler beim Starten der Behandlung.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Move to the next step
  const handleNextStep = async () => {
    if (currentStep >= treatmentSteps.length - 1) return;
    
    try {
      setUpdatingProgress(true);
      
      const nextStep = currentStep + 1;
      
      await sessionsAPI.updateTreatmentProgress(sessionId, {
        currentStep: nextStep
      });
      
      setCurrentStep(nextStep);
      
      // Notify parent component if provided
      if (onTreatmentStatusChange) {
        onTreatmentStatusChange('IN_PROGRESS', nextStep);
      }
      
    } catch (err) {
      console.error('Error updating current step:', err);
      setError('Fehler beim Aktualisieren des aktuellen Schritts.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Move to the previous step
  const handlePrevStep = () => {
    if (currentStep <= 0) return;
    
    try {
      setUpdatingProgress(true);
      
      const prevStep = currentStep - 1;
      
      sessionsAPI.updateTreatmentProgress(sessionId, {
        currentStep: prevStep
      }).then(() => {
        setCurrentStep(prevStep);
        
        // Notify parent component if provided
        if (onTreatmentStatusChange) {
          onTreatmentStatusChange('IN_PROGRESS', prevStep);
        }
      });
      
    } catch (err) {
      console.error('Error updating current step:', err);
      setError('Fehler beim Aktualisieren des aktuellen Schritts.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Complete the treatment
  const handleCompleteTreatment = async () => {
    try {
      setUpdatingProgress(true);
      
      await sessionsAPI.updateTreatmentProgress(sessionId, {
        status: 'COMPLETED',
        currentStep: treatmentSteps.length - 1
      });
      
      setCompleted(true);
      
      // Notify parent component if provided
      if (onTreatmentStatusChange) {
        onTreatmentStatusChange('COMPLETED');
      }
      
      // Close the player
      setOpenPlayer(false);
      
      // Refresh data
      await fetchSessionTreatmentTemplate();
      
    } catch (err) {
      console.error('Error completing treatment:', err);
      setError('Fehler beim Abschließen der Behandlung.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Close the player
  const handleClosePlayer = () => {
    setOpenPlayer(false);
  };

  // Render the treatment card
  const renderTreatmentCard = () => {
    if (loading) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
            <CircularProgress size={30} />
          </CardContent>
        </Card>
      );
    }

    if (!sessionTreatmentTemplate) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Behandlungsplan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Für diese Session wurde noch kein Behandlungsplan vom Arzt zugewiesen.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const template = sessionTreatmentTemplate.treatmentTemplate;
    
    return (
      <Card 
        sx={{ 
          mb: 3, 
          border: sessionTreatmentTemplate.status === 'NEW' ? '2px solid #2196f3' : 'none',
          boxShadow: sessionTreatmentTemplate.status === 'NEW' ? '0 0 8px rgba(33, 150, 243, 0.3)' : 'none'
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Behandlungsplan</Typography>
            {sessionTreatmentTemplate.status !== 'COMPLETED' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  sessionTreatmentTemplate.status === 'NEW' ? <PlayIcon /> : 
                  sessionTreatmentTemplate.status === 'IN_PROGRESS' ? <PlayIcon /> : null
                }
                onClick={handleStartTreatment}
                disabled={updatingProgress}
              >
                {sessionTreatmentTemplate.status === 'NEW' ? 'Behandlung starten' : 'Behandlung fortsetzen'}
              </Button>
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              {template.title}
              {sessionTreatmentTemplate.status === 'COMPLETED' && (
                <Box component="span" sx={{ ml: 1, color: 'success.main', display: 'inline-flex', alignItems: 'center' }}>
                  <CheckIcon fontSize="small" />
                  <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                    Abgeschlossen
                  </Typography>
                </Box>
              )}
            </Typography>
            
            {template.description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {template.description}
              </Typography>
            )}
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Autor:</strong> {template.createdBy.firstName} {template.createdBy.lastName}
            </Typography>
            
            <Typography variant="body2">
              <strong>Schritte:</strong> {treatmentSteps.length}
            </Typography>
            
            {sessionTreatmentTemplate.status === 'IN_PROGRESS' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Aktueller Schritt:</strong> {currentStep + 1} von {treatmentSteps.length}
              </Typography>
            )}
            
            {sessionTreatmentTemplate.startedAt && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Gestartet:</strong> {new Date(sessionTreatmentTemplate.startedAt).toLocaleString()}
              </Typography>
            )}
            
            {sessionTreatmentTemplate.completedAt && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Abgeschlossen:</strong> {new Date(sessionTreatmentTemplate.completedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderTreatmentCard()}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Treatment Player Dialog */}
      <Dialog
        open={openPlayer}
        onClose={handleClosePlayer}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{sessionTreatmentTemplate?.treatmentTemplate.title}</Typography>
            <IconButton onClick={handleClosePlayer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {treatmentSteps.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Paper elevation={0} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {treatmentSteps[currentStep].title}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {treatmentSteps[currentStep].content}
                </Typography>
              </Paper>
              
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mx: 2 }}>
                  Schritt {currentStep + 1} von {treatmentSteps.length}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button
            onClick={handlePrevStep}
            disabled={currentStep === 0 || updatingProgress}
            startIcon={<PrevIcon />}
          >
            Vorheriger Schritt
          </Button>
          
          <Box>
            <Button
              onClick={handleCompleteTreatment}
              color="success"
              variant="contained"
              disabled={updatingProgress}
              sx={{ mr: 1 }}
            >
              Behandlung abschließen
            </Button>
            
            {currentStep < treatmentSteps.length - 1 && (
              <Button
                onClick={handleNextStep}
                color="primary"
                variant="contained"
                disabled={updatingProgress}
                endIcon={<NextIcon />}
              >
                Nächster Schritt
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TreatmentTemplatePlayer; 