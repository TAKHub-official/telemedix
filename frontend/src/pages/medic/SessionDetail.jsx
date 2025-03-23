import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { sessionService } from '../../services/sessionService';

// Import extracted components
import SessionHeader from '../../components/medic/SessionHeader';
import PatientInfo from '../../components/medic/PatientInfo';
import InjuryInfo from '../../components/medic/InjuryInfo';
import PreviousTreatment from '../../components/medic/PreviousTreatment';
import VitalSigns from '../../components/medic/VitalSigns';
import TreatmentTemplatePlayer from '../../components/medic/TreatmentTemplatePlayer';
import TreatmentEvaluation from '../../components/medic/TreatmentEvaluation';
import { sessionsAPI } from '../../services/api';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionTreatmentTemplate, setSessionTreatmentTemplate] = useState(null);
  const [treatmentTemplateLoading, setTreatmentTemplateLoading] = useState(true);
  
  // Fetch session details
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

  // Fetch session treatment template
  useEffect(() => {
    const fetchSessionTreatmentTemplate = async () => {
      if (!id) return;
      
      try {
        setTreatmentTemplateLoading(true);
        
        const response = await sessionsAPI.getSessionTreatmentTemplate(id);
        
        if (response && response.data && response.data.sessionTreatmentTemplate) {
          setSessionTreatmentTemplate(response.data.sessionTreatmentTemplate);
        }
      } catch (err) {
        console.error('Error fetching session treatment template:', err);
        // Kein Error-State hier, da kein Template OK ist
      } finally {
        setTreatmentTemplateLoading(false);
      }
    };
    
    fetchSessionTreatmentTemplate();
  }, [id]);

  const handleBack = () => {
    navigate('/medic/sessions');
  };

  const handleVitalSignsUpdated = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getSessionById(id);
      
      // Extract session data from response
      let updatedSessionData = null;
      if (response && response.data && response.data.session) {
        updatedSessionData = response.data.session;
      } else if (response && response.session) {
        updatedSessionData = response.session;
      } else if (response && response.data) {
        updatedSessionData = response.data;
      }
      
      if (updatedSessionData) {
        setSession(updatedSessionData);
      }
    } catch (err) {
      console.error('Error refreshing session data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Callback für Änderungen am Behandlungsplan-Status
  const handleTreatmentStatusChange = async (status, step) => {
    console.log('Treatment status changed:', status, 'Current step:', step);
    
    // Aktualisieren der Daten, wenn der Status geändert wurde
    try {
      setTreatmentTemplateLoading(true);
      
      const response = await sessionsAPI.getSessionTreatmentTemplate(id);
      
      if (response && response.data && response.data.sessionTreatmentTemplate) {
        setSessionTreatmentTemplate(response.data.sessionTreatmentTemplate);
      }
    } catch (err) {
      console.error('Error refreshing session treatment template:', err);
    } finally {
      setTreatmentTemplateLoading(false);
    }
  };

  // Callback nach Bewertung
  const handleEvaluationSubmitted = () => {
    console.log('Evaluation submitted');
    // Optional: Session-Daten neu laden
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
      <SessionHeader session={session} />
      
      {/* Patient Info */}
      <PatientInfo medicalRecord={session.medicalRecord} />
      
      {/* Injury Information */}
      <InjuryInfo medicalRecord={session.medicalRecord} />
      
      {/* Previous Treatment - includes both medical record and treatment notes */}
      <PreviousTreatment 
        medicalRecord={session.medicalRecord}
        notes={session.notes}
      />
      
      {/* Vital Signs */}
      <VitalSigns 
        session={session} 
        onVitalSignsUpdated={handleVitalSignsUpdated} 
      />
      
      {/* Treatment Template Player - ersetzt den alten statischen TreatmentPlan */}
      <TreatmentTemplatePlayer 
        sessionId={id}
        onTreatmentStatusChange={handleTreatmentStatusChange}
      />
      
      {/* Treatment Evaluation - nur anzeigen, wenn Behandlung abgeschlossen */}
      {!treatmentTemplateLoading && sessionTreatmentTemplate && (
        <TreatmentEvaluation 
          sessionId={id}
          treatmentTemplate={sessionTreatmentTemplate}
          onEvaluationSubmitted={handleEvaluationSubmitted}
        />
      )}
    </Box>
  );
};

export default SessionDetail; 