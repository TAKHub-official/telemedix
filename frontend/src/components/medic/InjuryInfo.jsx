import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box
} from '@mui/material';

const InjuryInfo = ({ medicalRecord }) => {
  // Parse medical record data
  const getMedicalRecordData = () => {
    if (!medicalRecord?.patientHistory) return null;
    
    try {
      return JSON.parse(medicalRecord.patientHistory);
    } catch (error) {
      console.error('Error parsing patient history:', error);
      return null;
    }
  };

  const medicalRecordData = getMedicalRecordData();

  if (!medicalRecord || !medicalRecordData) {
    return null;
  }

  return (
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
          
          {medicalRecord.allergies && (
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Allergien:</strong> {medicalRecord.allergies}
              </Typography>
            </Grid>
          )}
          
          {medicalRecord.currentMedications && (
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Aktuelle Medikation:</strong> {medicalRecord.currentMedications}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InjuryInfo; 