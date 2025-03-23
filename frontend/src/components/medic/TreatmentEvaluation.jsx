import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { sessionsAPI } from '../../services/api';

const TreatmentEvaluation = ({ sessionId, treatmentTemplate, onEvaluationSubmitted }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [effectiveness, setEffectiveness] = useState(3);
  const [patientCompliance, setPatientCompliance] = useState('GOOD');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Öffnet den Dialog zur Bewertung
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError(null);
  };

  // Schließt den Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Sendet die Bewertung ab
  const handleSubmitEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Hier API-Aufruf zur Speicherung der Bewertung
      await sessionsAPI.evaluateTreatment(sessionId, {
        effectiveness,
        patientCompliance,
        comments
      });

      setSuccess(true);
      
      // Dialog schließen
      setTimeout(() => {
        setOpenDialog(false);
        
        // Callback aufrufen, falls übergeben
        if (onEvaluationSubmitted) {
          onEvaluationSubmitted();
        }
      }, 1500);

    } catch (err) {
      console.error('Error submitting treatment evaluation:', err);
      setError('Fehler beim Speichern der Bewertung. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Behandlung ist nicht abgeschlossen oder kein Template zugewiesen
  if (!treatmentTemplate || treatmentTemplate.status !== 'COMPLETED') {
    return null;
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Behandlungsbewertung</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<StarIcon />}
              onClick={handleOpenDialog}
            >
              Behandlung bewerten
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Bitte bewerten Sie den Erfolg der Behandlung nach "{treatmentTemplate.treatmentTemplate.title}".
            Ihre Bewertung hilft bei der Verbesserung zukünftiger Behandlungspläne.
          </Typography>
        </CardContent>
      </Card>

      {/* Dialog zur Bewertung */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Behandlung bewerten</DialogTitle>
        
        <DialogContent dividers>
          {success ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Vielen Dank für Ihre Bewertung! Die Daten wurden erfolgreich gespeichert.
            </Alert>
          ) : (
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <Typography variant="subtitle1" gutterBottom>
                Behandlungsplan: {treatmentTemplate.treatmentTemplate.title}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography component="legend" gutterBottom>
                  Wie effektiv war der Behandlungsplan?
                </Typography>
                <Rating
                  name="effectiveness"
                  value={effectiveness}
                  onChange={(event, newValue) => {
                    setEffectiveness(newValue);
                  }}
                  size="large"
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {effectiveness === 1 && 'Nicht effektiv'}
                    {effectiveness === 2 && 'Wenig effektiv'}
                    {effectiveness === 3 && 'Mäßig effektiv'}
                    {effectiveness === 4 && 'Effektiv'}
                    {effectiveness === 5 && 'Sehr effektiv'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Wie war die Mitarbeit des Patienten?</FormLabel>
                  <RadioGroup
                    name="patientCompliance"
                    value={patientCompliance}
                    onChange={(e) => setPatientCompliance(e.target.value)}
                  >
                    <FormControlLabel 
                      value="EXCELLENT" 
                      control={<Radio />} 
                      label="Ausgezeichnet"
                    />
                    <FormControlLabel 
                      value="GOOD" 
                      control={<Radio />} 
                      label="Gut" 
                    />
                    <FormControlLabel 
                      value="FAIR" 
                      control={<Radio />} 
                      label="Mittelmäßig"
                    />
                    <FormControlLabel 
                      value="POOR" 
                      control={<Radio />} 
                      label="Schlecht"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Kommentare und Beobachtungen"
                  multiline
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        
        {!success && (
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmitEvaluation} 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <ThumbUpIcon />}
            >
              {loading ? 'Wird gespeichert...' : 'Bewertung abschicken'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default TreatmentEvaluation; 