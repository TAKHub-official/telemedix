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
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { sessionService } from '../../services/sessionService';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                  {medicalRecordData.age && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Alter:</strong> {medicalRecordData.age}
                      </Typography>
                    </Grid>
                  )}
                  
                  {medicalRecordData.gender && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Geschlecht:</strong> {
                          medicalRecordData.gender === 'MALE' ? 'Männlich' :
                          medicalRecordData.gender === 'FEMALE' ? 'Weiblich' :
                          medicalRecordData.gender
                        }
                      </Typography>
                    </Grid>
                  )}
                  
                  {medicalRecordData.chiefComplaint && (
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        <strong>Hauptbeschwerde:</strong> {medicalRecordData.chiefComplaint}
                      </Typography>
                    </Grid>
                  )}
                  
                  {medicalRecordData.incidentDescription && (
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        <strong>Beschreibung des Vorfalls:</strong>
                        <Box component="p" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                          {medicalRecordData.incidentDescription}
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
                </>
              )}
              
              {session.medicalRecord.allergies && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Allergien:</strong> {session.medicalRecord.allergies}
                  </Typography>
                </Grid>
              )}
              
              {session.medicalRecord.currentMedications && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Aktuelle Medikation:</strong> {session.medicalRecord.currentMedications}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Vital Signs */}
      {session.vitalSigns && session.vitalSigns.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vitalwerte
            </Typography>
            
            <Grid container spacing={2}>
              {session.vitalSigns.map((vitalSign) => (
                <Grid item xs={12} sm={6} md={4} key={vitalSign.id}>
                  <Typography variant="body1">
                    <strong>
                      {vitalSign.type === 'HEART_RATE' ? 'Herzfrequenz' :
                       vitalSign.type === 'BLOOD_PRESSURE' ? 'Blutdruck' :
                       vitalSign.type === 'OXYGEN_SATURATION' ? 'Sauerstoffsättigung' :
                       vitalSign.type === 'RESPIRATORY_RATE' ? 'Atemfrequenz' :
                       vitalSign.type === 'TEMPERATURE' ? 'Temperatur' :
                       vitalSign.type === 'BLOOD_GLUCOSE' ? 'Blutzucker' :
                       vitalSign.type === 'PAIN_LEVEL' ? 'Schmerzniveau' :
                       vitalSign.type === 'CONSCIOUSNESS' ? 'Bewusstseinszustand' :
                       vitalSign.type}:
                    </strong>{' '}
                    {vitalSign.value} {vitalSign.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(vitalSign.timestamp).toLocaleString('de-DE')}
                  </Typography>
                </Grid>
              ))}
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
            Notizen
          </Typography>
          
          {session.notes && session.notes.length > 0 ? (
            <List>
              {session.notes.map((note, index) => (
                <React.Fragment key={note.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={<Typography variant="body1">{note.content}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(note.createdAt).toLocaleString('de-DE')}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < session.notes.length - 1 && <Divider />}
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
    </Box>
  );
};

export default SessionDetail; 