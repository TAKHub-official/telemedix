import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';

const PatientInfo = ({ medicalRecord }) => {
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
          Patientendaten
        </Typography>
        
        <Grid container spacing={2}>
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
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientInfo; 