import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Box,
  Alert
} from '@mui/material';

const PreviousTreatment = ({ medicalRecord, notes }) => {
  console.log("PreviousTreatment - Received medicalRecord:", medicalRecord);
  console.log("PreviousTreatment - Received notes:", notes);
  
  // Parse medical record data
  const getMedicalRecordData = () => {
    if (!medicalRecord?.patientHistory) {
      console.log("PreviousTreatment - No patientHistory found in medicalRecord");
      return null;
    }
    
    try {
      let parsedData;
      if (typeof medicalRecord.patientHistory === 'string') {
        console.log("PreviousTreatment - patientHistory is a string, parsing JSON");
        parsedData = JSON.parse(medicalRecord.patientHistory);
      } else {
        console.log("PreviousTreatment - patientHistory is already an object");
        parsedData = medicalRecord.patientHistory;
      }
      
      console.log("PreviousTreatment - Parsed medical record data:", parsedData);
      
      // Schaue speziell nach den treatment-Daten
      if (parsedData?.treatment) {
        console.log("PreviousTreatment - Found treatment data in patientHistory:", parsedData.treatment);
      } else {
        console.log("PreviousTreatment - No treatment data found in patientHistory");
      }
      
      if (!parsedData?.treatment) {
        // Check if treatment data might be stored at the root level
        console.log("PreviousTreatment - Checking for treatment fields at root level");
        const potentialTreatmentFields = [
          'breathing', 'access', 'intubation', 'hemostasis',
          'perfusors', 'medicationText', 'extendedMeasures',
          'reanimation', 'thoraxDrainage', 'decompression'
        ];
        
        const treatmentFromRoot = {};
        let hasTreatmentFields = false;
        
        potentialTreatmentFields.forEach(field => {
          if (parsedData[field]) {
            treatmentFromRoot[field] = parsedData[field];
            hasTreatmentFields = true;
          }
        });
        
        if (hasTreatmentFields) {
          console.log("PreviousTreatment - Found treatment fields at root level:", treatmentFromRoot);
          parsedData.treatment = treatmentFromRoot;
        }
      }
      
      // If we're still missing treatment data, check if it's in another format
      if (!parsedData?.treatment && medicalRecord.treatment) {
        console.log("PreviousTreatment - Found treatment at medicalRecord.treatment");
        parsedData.treatment = medicalRecord.treatment;
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error parsing patient history:', error);
      return null;
    }
  };

  const medicalRecordData = getMedicalRecordData();
  const hasMedicalRecordTreatment = medicalRecordData?.treatment && 
    Object.values(medicalRecordData.treatment).some(value => !!value);
  
  // Find treatment notes
  const treatmentNote = notes?.find(note => note.type === 'TREATMENT');
  const hasTreatmentNotes = !!treatmentNote;
  
  console.log("Treatment component - Has medical record treatment:", hasMedicalRecordTreatment);
  console.log("Treatment component - Treatment data from medical record:", medicalRecordData?.treatment);
  console.log("Treatment component - Has treatment notes:", hasTreatmentNotes);
  if (hasTreatmentNotes) {
    console.log("Treatment component - Treatment note content:", treatmentNote.content);
  }
  
  // Manual treatment fields based on anamnesis form
  // These fields correspond to Step 4 (Behandlung bisher) in the anamnesis form
  const treatmentFields = [
    { key: 'breathing', label: 'Beatmung' },
    { key: 'access', label: 'Zugang' },
    { key: 'intubation', label: 'Intubation' },
    { key: 'hemostasis', label: 'Blutstillung' },
    { key: 'perfusors', label: 'Perfusoren' },
    { key: 'medicationText', label: 'Laufende Medikation' },
    { key: 'extendedMeasures', label: 'Erweiterte Maßnahmen' },
    { key: 'reanimation', label: 'Reanimation' },
    { key: 'thoraxDrainage', label: 'Thoraxdrainage' },
    { key: 'decompression', label: 'Dekompression' }
  ];
  
  // Liste der zu ignorierenden Felder, die nicht angezeigt werden sollen
  const ignoredFields = ['circulation', 'cSpine', 'analgesia'];
  
  // Try to extract treatment data from any available source
  let treatmentData = null;
  
  if (hasMedicalRecordTreatment) {
    console.log("PreviousTreatment - Using medical record treatment data");
    treatmentData = medicalRecordData.treatment;
  } else {
    // Check if treatment data might be in the medicalRecord directly
    console.log("PreviousTreatment - Checking for treatment data directly in medicalRecord");
    const fallbackTreatment = {};
    let hasFallbackData = false;
    
    if (medicalRecord) {
      treatmentFields.forEach(field => {
        if (medicalRecord[field.key]) {
          fallbackTreatment[field.key] = medicalRecord[field.key];
          hasFallbackData = true;
        }
      });
    }
    
    if (hasFallbackData) {
      console.log("PreviousTreatment - Using fallback treatment data from medicalRecord");
      treatmentData = fallbackTreatment;
    }
  }
  
  // Wenn keine Daten gefunden wurden, versuchen wir, sie aus den Treatment Notes zu extrahieren
  if (!treatmentData && hasTreatmentNotes) {
    console.log("PreviousTreatment - Trying to extract treatment data from treatment notes");
    const extractedTreatment = {};
    
    // Versuch, Daten aus dem Treatment-Note zu extrahieren
    const noteContent = treatmentNote.content;
    
    // Prüfen auf verschiedene Felder
    const fieldPatterns = [
      { pattern: /Zugang: ([^.]+)\./, key: 'access' },
      { pattern: /Perfusoren: ([^.]+)\./, key: 'perfusors' },
      { pattern: /Laufende Medikation: ([^.]+)\./, key: 'medicationText' },
      { pattern: /Reanimation: ([^.]+)\./, key: 'reanimation' },
      { pattern: /Intubation: ([^.]+)\./, key: 'intubation' },
      { pattern: /Beatmung: ([^.]+)\./, key: 'breathing' },
      { pattern: /Thorax Drainage: ([^.]+)\./, key: 'thoraxDrainage' },
      { pattern: /Dekompression: ([^.]+)\./, key: 'decompression' },
      { pattern: /Erweiterte Maßnahmen: ([^.]+)\./, key: 'extendedMeasures' },
      { pattern: /Blutstillung: ([^.]+)\./, key: 'hemostasis' }
    ];
    
    fieldPatterns.forEach(({ pattern, key }) => {
      const match = noteContent.match(pattern);
      if (match && match[1] && match[1].toLowerCase() !== 'keine') {
        extractedTreatment[key] = match[1].trim();
      }
    });
    
    if (Object.keys(extractedTreatment).length > 0) {
      console.log("PreviousTreatment - Extracted treatment data from notes:", extractedTreatment);
      treatmentData = extractedTreatment;
    }
  }
  
  // Process treatment notes if available
  let parsedTreatmentNotes = {};
  if (hasTreatmentNotes) {
    const treatmentContent = treatmentNote.content;
    
    // Split by period and space to get each section
    const treatmentSections = treatmentContent.split('. ').filter(Boolean);
    
    // Parse each section into key-value pairs
    treatmentSections.forEach(section => {
      // Check if the section contains a colon (indicating a category)
      const colonIndex = section.indexOf(':');
      if (colonIndex > 0) {
        const key = section.substring(0, colonIndex).trim();
        const value = section.substring(colonIndex + 1).trim();
        parsedTreatmentNotes[key] = value;
      } else {
        // For sections without a colon, add them as additional notes
        if (!parsedTreatmentNotes['Weitere Angaben']) {
          parsedTreatmentNotes['Weitere Angaben'] = section;
        } else {
          parsedTreatmentNotes['Weitere Angaben'] += '. ' + section;
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
          parsedTreatmentNotes[key] = value;
        } else {
          if (!parsedTreatmentNotes['Weitere Angaben']) {
            parsedTreatmentNotes['Weitere Angaben'] = lastSection;
          } else {
            parsedTreatmentNotes['Weitere Angaben'] += '. ' + lastSection;
          }
        }
      }
    }
    
    console.log("Parsed treatment notes:", parsedTreatmentNotes);
  }

  // Wenn gar keine Behandlungsdaten gefunden wurden, zeigen wir eine informative Meldung an
  if (!treatmentData && !hasTreatmentNotes) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Behandlung bisher
          </Typography>
          <Alert severity="info">
            Keine Behandlungsinformationen verfügbar.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bitte fügen Sie Behandlungsinformationen im Anamnesebogen unter Schritt 4 (Behandlung bisher) hinzu.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Konvertiere treatment notes zu einem Behandlungsdaten-Objekt, wenn kein treatment data vorhanden ist
  if (!treatmentData && Object.keys(parsedTreatmentNotes).length > 0) {
    treatmentData = {};
    Object.entries(parsedTreatmentNotes).forEach(([key, value]) => {
      // Entferne ":" aus dem Schlüsselnamen, falls vorhanden
      const cleanKey = key.replace(':', '').trim();
      treatmentData[cleanKey] = value;
    });
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behandlung bisher
        </Typography>
        
        {/* Medical Record Treatment Data */}
        {treatmentData && (
          <>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2}>
                {/* Direkte Behandlungsdaten aus dem treatment-Objekt */}
                {treatmentFields.map((field) => 
                  treatmentData[field.key] ? (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <Typography variant="body1">
                        <strong>{field.label}:</strong> {treatmentData[field.key]}
                      </Typography>
                    </Grid>
                  ) : null
                )}
                
                {/* Für den Fall, dass wir unbekannte Felder haben, zeigen wir diese auch an */}
                {Object.entries(treatmentData)
                  .filter(([key]) => !treatmentFields.some(field => field.key === key) && !ignoredFields.includes(key))
                  .map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="body1">
                        <strong>{key}:</strong> {value}
                      </Typography>
                    </Grid>
                  ))
                }
              </Grid>
            </Box>
          </>
        )}
        
        {/* Display a divider if both types of data are present */}
        {treatmentData && hasTreatmentNotes && Object.keys(parsedTreatmentNotes).length > 0 && (
          <Divider sx={{ my: 2 }} />
        )}
        
        {/* Treatment Notes (wenn sie sich von den treatment-Daten unterscheiden) */}
        {hasTreatmentNotes && Object.keys(parsedTreatmentNotes).length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Klinische Behandlung
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Grid container spacing={2}>
                {Object.entries(parsedTreatmentNotes).map(([key, value], index) => (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">{key}</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviousTreatment; 