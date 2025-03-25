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
      
      // If we have treatment data in patientHistory, use it directly
      if (parsedData?.treatment) {
        console.log("PreviousTreatment - Found treatment data in patientHistory:", parsedData.treatment);
        
        // Ensure all treatment fields are properly extracted
        const treatmentData = {
          ...parsedData.treatment,
          // Add ventilation fields if they exist at root level
          ventilationPeep: parsedData.ventilationPeep || parsedData.treatment.ventilationPeep,
          ventilationFio2: parsedData.ventilationFio2 || parsedData.treatment.ventilationFio2,
          ventilationTidalVolume: parsedData.ventilationTidalVolume || parsedData.treatment.ventilationTidalVolume,
          ventilationRespiratoryRate: parsedData.ventilationRespiratoryRate || parsedData.treatment.ventilationRespiratoryRate,
          ventilationInspiratoryTime: parsedData.ventilationInspiratoryTime || parsedData.treatment.ventilationInspiratoryTime,
          ventilationMode: parsedData.ventilationMode || parsedData.treatment.ventilationMode,
          // Add perfusor fields if they exist at root level
          perfusorCount: parsedData.perfusorCount || parsedData.treatment.perfusorCount,
          perfusorMedication: parsedData.perfusorMedication || parsedData.treatment.perfusorMedication,
          // Add extended measures if they exist at root level
          extendedNarcosis: parsedData.extendedNarcosis || parsedData.treatment.extendedNarcosis,
          extendedStiffneck: parsedData.extendedStiffneck || parsedData.treatment.extendedStiffneck,
          extendedVacuumMattress: parsedData.extendedVacuumMattress || parsedData.treatment.extendedVacuumMattress,
          extendedGastricTube: parsedData.extendedGastricTube || parsedData.treatment.extendedGastricTube,
          extendedUrinaryCatheter: parsedData.extendedUrinaryCatheter || parsedData.treatment.extendedUrinaryCatheter
        };
        
        parsedData.treatment = treatmentData;
        return parsedData;
      }
      
      // If no treatment data found, create a treatment object from available fields
      const treatmentData = {};
      
      // Check for treatment fields at root level
      const treatmentFields = [
        'breathing', 'access', 'intubation', 'hemostasis',
        'perfusors', 'medicationText', 'extendedMeasures',
        'reanimation', 'thoraxDrainage', 'decompression',
        'treatmentSoFar',
        // Add ventilation fields
        'ventilationPeep', 'ventilationFio2', 'ventilationTidalVolume',
        'ventilationRespiratoryRate', 'ventilationInspiratoryTime', 'ventilationMode',
        // Add extended measures fields
        'extendedNarcosis', 'extendedStiffneck', 'extendedVacuumMattress',
        'extendedGastricTube', 'extendedUrinaryCatheter',
        // Add perfusor fields
        'perfusorCount', 'perfusorMedication'
      ];
      
      treatmentFields.forEach(field => {
        if (parsedData[field]) {
          treatmentData[field] = parsedData[field];
        }
      });
      
      if (Object.keys(treatmentData).length > 0) {
        console.log("PreviousTreatment - Created treatment data from root fields:", treatmentData);
        parsedData.treatment = treatmentData;
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
    { key: 'breathing', label: 'Atmung / Beatmung' },
    { key: 'access', label: 'Zugang' },
    { key: 'intubation', label: 'Intubation' },
    { key: 'perfusors', label: 'Perfusoren' },
    { key: 'medicationText', label: 'Laufende/vergangene Medikation' },
    { key: 'reanimation', label: 'Reanimation' },
    { key: 'thoraxDrainage', label: 'Thorax Drainage' },
    { key: 'decompression', label: 'Dekompression' },
    { key: 'extendedMeasures', label: 'Erweiterte Maßnahmen' },
    { key: 'bloodStopping', label: 'Blutstillung' },
    { key: 'treatmentSoFar', label: 'Weitere Behandlungsmaßnahmen' }
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
      { pattern: /Perfusoren: (\d+)(?: Perfusor(?:en)?: ([^.]+))?\./, key: 'perfusors' },
      { pattern: /Laufende Medikation: ([^.]+)\./, key: 'medicationText' },
      { pattern: /Reanimation: ([^.]+)\./, key: 'reanimation' },
      { pattern: /Intubation: ([^.]+)\./, key: 'intubation' },
      { pattern: /Beatmung: ([^.]+)\./, key: 'breathing' },
      { pattern: /Thorax Drainage: ([^.]+)\./, key: 'thoraxDrainage' },
      { pattern: /Dekompression: ([^.]+)\./, key: 'decompression' },
      { pattern: /Erweiterte Maßnahmen: ([^.]+)\./, key: 'extendedMeasures' },
      { pattern: /Blutstillung: ([^.]+)\./, key: 'bloodStopping' },
      { pattern: /Weitere Behandlungsmaßnahmen: ([^.]+)\./, key: 'treatmentSoFar' },
      { pattern: /PEEP: (\d+) mbar/, key: 'ventilationPeep' },
      { pattern: /FiO₂: (\d+)%/, key: 'ventilationFio2' },
      { pattern: /Tidalvolumen: (\d+) ml/, key: 'ventilationTidalVolume' },
      { pattern: /Atemfrequenz: (\d+)\/min/, key: 'ventilationRespiratoryRate' },
      { pattern: /Inspirationszeit: (\d+)s/, key: 'ventilationInspiratoryTime' },
      { pattern: /Modus: ([^.]+)\./, key: 'ventilationMode' }
    ];
    
    fieldPatterns.forEach(({ pattern, key }) => {
      const match = noteContent.match(pattern);
      if (match) {
        if (key === 'perfusors') {
          const count = match[1];
          const medication = match[2];
          if (count && count !== '0') {
            extractedTreatment.perfusorCount = count;
            if (medication) {
              extractedTreatment.perfusorMedication = medication;
            }
          }
        } else if (key === 'extendedMeasures') {
          const measures = match[1].split(',').map(m => m.trim());
          measures.forEach(measure => {
            switch(measure) {
              case 'Narkose':
                extractedTreatment.extendedNarcosis = true;
                break;
              case 'Stiffneck':
                extractedTreatment.extendedStiffneck = true;
                break;
              case 'Vakuum-Matratze':
                extractedTreatment.extendedVacuumMattress = true;
                break;
              case 'Magensonde':
                extractedTreatment.extendedGastricTube = true;
                break;
              case 'Urinkatheter':
                extractedTreatment.extendedUrinaryCatheter = true;
                break;
            }
          });
        } else if (key.startsWith('ventilation')) {
          extractedTreatment[key] = match[1];
        } else if (match[1]) {
          extractedTreatment[key] = match[1].trim();
        }
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
        
        // Special handling for extended measures
        if (key === 'Erweiterte Maßnahmen') {
          const measures = value.split(',').map(m => m.trim());
          measures.forEach(measure => {
            switch(measure) {
              case 'Narkose':
                extractedTreatment.extendedNarcosis = true;
                break;
              case 'Stiffneck':
                extractedTreatment.extendedStiffneck = true;
                break;
              case 'Vakuum-Matratze':
                extractedTreatment.extendedVacuumMattress = true;
                break;
              case 'Magensonde':
                extractedTreatment.extendedGastricTube = true;
                break;
              case 'Urinkatheter':
                extractedTreatment.extendedUrinaryCatheter = true;
                break;
            }
          });
        } else {
          parsedTreatmentNotes[key] = value;
        }
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
          
          // Special handling for extended measures
          if (key === 'Erweiterte Maßnahmen') {
            const measures = value.split(',').map(m => m.trim());
            measures.forEach(measure => {
              switch(measure) {
                case 'Narkose':
                  extractedTreatment.extendedNarcosis = true;
                  break;
                case 'Stiffneck':
                  extractedTreatment.extendedStiffneck = true;
                  break;
                case 'Vakuum-Matratze':
                  extractedTreatment.extendedVacuumMattress = true;
                  break;
                case 'Magensonde':
                  extractedTreatment.extendedGastricTube = true;
                  break;
                case 'Urinkatheter':
                  extractedTreatment.extendedUrinaryCatheter = true;
                  break;
              }
            });
          } else {
            parsedTreatmentNotes[key] = value;
          }
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
      // Spezielle Behandlung für Beatmungswerte
      if (cleanKey === 'PEEP') treatmentData.ventilationPeep = value;
      else if (cleanKey === 'FiO₂') treatmentData.ventilationFio2 = value;
      else if (cleanKey === 'Tidalvolumen') treatmentData.ventilationTidalVolume = value;
      else if (cleanKey === 'Atemfrequenz') treatmentData.ventilationRespiratoryRate = value;
      else if (cleanKey === 'Inspirationszeit') treatmentData.ventilationInspiratoryTime = value;
      else if (cleanKey === 'Modus') treatmentData.ventilationMode = value;
      else treatmentData[cleanKey] = value;
    });
  }

  // Render treatment fields
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behandlung bisher
        </Typography>
        <Grid container spacing={2}>
          {treatmentFields.map(({ key, label }) => {
            const value = treatmentData?.[key];
            
            // Special handling for breathing/ventilation
            if (key === 'breathing') {
              const breathingValue = value;
              if (!breathingValue) return null;
              
              return (
                <Grid item xs={12} key={key}>
                  <Typography variant="body2">
                    <strong>{label}:</strong> {breathingValue}
                    {breathingValue === 'Maschinell' && (
                      <>
                        {treatmentData.ventilationPeep && ` (PEEP: ${treatmentData.ventilationPeep} mbar)`}
                        {treatmentData.ventilationFio2 && ` (FiO₂: ${treatmentData.ventilationFio2}%)`}
                        {treatmentData.ventilationTidalVolume && ` (Tidalvolumen: ${treatmentData.ventilationTidalVolume} ml)`}
                        {treatmentData.ventilationRespiratoryRate && ` (Atemfrequenz: ${treatmentData.ventilationRespiratoryRate}/min)`}
                        {treatmentData.ventilationInspiratoryTime && ` (Inspirationszeit: ${treatmentData.ventilationInspiratoryTime}s)`}
                        {treatmentData.ventilationMode && ` (Modus: ${treatmentData.ventilationMode})`}
                      </>
                    )}
                  </Typography>
                </Grid>
              );
            }
            
            // Special handling for perfusors
            if (key === 'perfusors') {
              const perfusorCount = treatmentData.perfusorCount;
              const perfusorMedication = treatmentData.perfusorMedication || value;
              
              if (!perfusorCount || perfusorCount === '0') {
                return null;
              }
              
              return (
                <Grid item xs={12} key={key}>
                  <Typography variant="body2">
                    <strong>{label}:</strong> {perfusorCount} Perfusor{perfusorCount > 1 ? 'en' : ''}: {perfusorMedication || 'keine Medikation angegeben'}
                  </Typography>
                </Grid>
              );
            }
            
            // Special handling for extended measures
            if (key === 'extendedMeasures') {
              const measures = [];
              if (treatmentData.extendedNarcosis) measures.push('Narkose');
              if (treatmentData.extendedStiffneck) measures.push('Stiffneck');
              if (treatmentData.extendedVacuumMattress) measures.push('Vakuum-Matratze');
              if (treatmentData.extendedGastricTube) measures.push('Magensonde');
              if (treatmentData.extendedUrinaryCatheter) measures.push('Urinkatheter');
              
              if (measures.length === 0) {
                return null;
              }
              
              return (
                <Grid item xs={12} key={key}>
                  <Typography variant="body2">
                    <strong>{label}:</strong> {measures.join(', ')}
                  </Typography>
                </Grid>
              );
            }
            
            // Special handling for treatmentSoFar
            if (key === 'treatmentSoFar') {
              if (!value) {
                return null;
              }
              
              return (
                <Grid item xs={12} key={key}>
                  <Typography variant="body2">
                    <strong>{label}:</strong> {value}
                  </Typography>
                </Grid>
              );
            }
            
            // Default rendering for other fields
            if (!value) {
              return null;
            }
            
            return (
              <Grid item xs={12} key={key}>
                <Typography variant="body2">
                  <strong>{label}:</strong> {value}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PreviousTreatment; 