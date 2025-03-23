import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';

const TreatmentNotes = ({ notes }) => {
  // Find treatment notes
  const treatmentNote = notes?.find(note => note.type === 'TREATMENT');
  
  if (!notes || !treatmentNote) {
    return null;
  }
  
  // Extract treatment information from the content
  // The format is typically "Category: Value. "
  const treatmentContent = treatmentNote.content;
  
  // Split by period and space to get each section
  const treatmentSections = treatmentContent.split('. ').filter(Boolean);
  
  // Parse each section into key-value pairs
  const parsedTreatment = {};
  
  treatmentSections.forEach(section => {
    // Check if the section contains a colon (indicating a category)
    const colonIndex = section.indexOf(':');
    if (colonIndex > 0) {
      const key = section.substring(0, colonIndex).trim();
      const value = section.substring(colonIndex + 1).trim();
      parsedTreatment[key] = value;
    } else {
      // For sections without a colon, add them as additional notes
      if (!parsedTreatment['Weitere Angaben']) {
        parsedTreatment['Weitere Angaben'] = section;
      } else {
        parsedTreatment['Weitere Angaben'] += '. ' + section;
      }
    }
  });
  
  // If there's a final section without a period, process it too
  if (treatmentContent.endsWith(' ') && !treatmentContent.endsWith('. ')) {
    const lastSection = treatmentContent.substring(treatmentContent.lastIndexOf('. ') + 2);
    if (lastSection) {
      const colonIndex = lastSection.indexOf(':');
      if (colonIndex > 0) {
        const key = lastSection.substring(0, colonIndex).trim();
        const value = lastSection.substring(colonIndex + 1).trim();
        parsedTreatment[key] = value;
      } else {
        if (!parsedTreatment['Weitere Angaben']) {
          parsedTreatment['Weitere Angaben'] = lastSection;
        } else {
          parsedTreatment['Weitere Angaben'] += '. ' + lastSection;
        }
      }
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behandlung bisher
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {Object.keys(parsedTreatment).length > 0 ? (
            Object.entries(parsedTreatment).map(([key, value], index) => (
              <Grid item xs={12} key={index}>
                <Typography variant="subtitle2" color="text.secondary">{key}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{treatmentContent}</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TreatmentNotes; 