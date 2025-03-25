import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { sessionService } from '../../services/sessionService';
import { 
  HEART_RATE_OPTIONS,
  SYSTOLIC_BP_OPTIONS,
  DIASTOLIC_BP_OPTIONS,
  OXYGEN_SATURATION_OPTIONS,
  RESPIRATORY_RATE_OPTIONS,
  TEMPERATURE_OPTIONS,
  BLOOD_GLUCOSE_OPTIONS,
  CONSCIOUSNESS_OPTIONS
} from '../../constants';

const VitalSigns = ({ session, onVitalSignsUpdated }) => {
  const [showEditVitals, setShowEditVitals] = useState(false);
  const [updatingAllVitals, setUpdatingAllVitals] = useState(false);
  const [updatingError, setUpdatingError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [currentVitalValues, setCurrentVitalValues] = useState({
    HEART_RATE: { value: '', unit: 'bpm' },
    BLOOD_PRESSURE: { systolic: '', diastolic: '', unit: 'mmHg' },
    OXYGEN_SATURATION: { value: '', unit: '%' },
    RESPIRATORY_RATE: { value: '', unit: 'breaths/min' },
    TEMPERATURE: { value: '', unit: '°C' },
    BLOOD_GLUCOSE: { value: '', unit: 'mg/dL' },
    PAIN_LEVEL: { value: '', unit: '/10' },
    CONSCIOUSNESS: { value: '', unit: '' }
  });

  // Initialize vital values from session data
  React.useEffect(() => {
    if (session && session.vitalSigns) {
      initializeVitalValues(session.vitalSigns);
    }
  }, [session]);

  // Initialize current vital values from the existing values
  const initializeVitalValues = (vitalSigns) => {
    if (!vitalSigns || vitalSigns.length === 0) return;
    
    const newVitalValues = { ...currentVitalValues };
    
    ['HEART_RATE', 'OXYGEN_SATURATION', 'RESPIRATORY_RATE', 'TEMPERATURE', 'BLOOD_GLUCOSE', 'PAIN_LEVEL', 'CONSCIOUSNESS'].forEach(type => {
      const latestVital = getLatestVitalSignByType(vitalSigns, type);
      if (latestVital && latestVital.value) {
        newVitalValues[type] = {
          value: latestVital.value,
          unit: latestVital.unit
        };
      } else {
        // Reset to "Nicht gemessen" if no value exists
        newVitalValues[type] = {
          value: '',
          unit: newVitalValues[type].unit
        };
      }
    });
    
    // Special handling for blood pressure
    const latestBP = getLatestVitalSignByType(vitalSigns, 'BLOOD_PRESSURE');
    if (latestBP && latestBP.value) {
      const [systolic, diastolic] = latestBP.value.split('/');
      newVitalValues.BLOOD_PRESSURE = {
        systolic,
        diastolic,
        unit: latestBP.unit
      };
    } else {
      // Reset to "Nicht gemessen" if no value exists
      newVitalValues.BLOOD_PRESSURE = {
        systolic: '',
        diastolic: '',
        unit: 'mmHg'
      };
    }
    
    setCurrentVitalValues(newVitalValues);
  };

  // Helper function to get latest vital sign of a specific type
  const getLatestVitalSignByType = (vitalSigns, type) => {
    if (!vitalSigns || vitalSigns.length === 0) return null;
    
    const filteredSigns = vitalSigns.filter(sign => sign.type === type);
    if (filteredSigns.length === 0) return null;
    
    // Sort by timestamp, newest first
    return filteredSigns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  };

  // Handle direct changes to vital values (inline editing)
  const handleDirectVitalChange = (type, value) => {
    if (type === 'BLOOD_PRESSURE') {
      // Special handling for blood pressure
      const { name, value: newValue } = value;
      
      // Get the numeric value for comparison
      const getNumericValue = (val) => {
        if (!val || val === '') return 0;
        if (val.startsWith('>')) return parseInt(val.substring(1));
        if (val.startsWith('<')) return parseInt(val.substring(1));
        return parseInt(val);
      };
      
      // Check if the new combination would be valid
      const currentSystolic = name === 'systolic' ? newValue : currentVitalValues.BLOOD_PRESSURE.systolic;
      const currentDiastolic = name === 'diastolic' ? newValue : currentVitalValues.BLOOD_PRESSURE.diastolic;
      
      // Only update if the combination is valid or one value is being cleared
      const systolicNum = getNumericValue(currentSystolic);
      const diastolicNum = getNumericValue(currentDiastolic);
      
      if (newValue === '' || currentSystolic === '' || currentDiastolic === '' || 
          (name === 'systolic' && systolicNum >= diastolicNum) || 
          (name === 'diastolic' && systolicNum >= diastolicNum)) {
        setCurrentVitalValues(prev => ({
          ...prev,
          BLOOD_PRESSURE: {
            ...prev.BLOOD_PRESSURE,
            [name]: newValue
          }
        }));
      }
    } else {
      // Standard handling for other vital signs
      setCurrentVitalValues(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          value
        }
      }));
    }
  };

  // Toggle edit mode / save changes
  const toggleEditMode = () => {
    // If we're in edit mode and clicking "Save"
    if (showEditVitals) {
      handleUpdateAllVitalSigns();
    } else {
      // Otherwise just toggle edit mode on
      setShowEditVitals(true);
    }
  };

  // Update all vital signs at once
  const handleUpdateAllVitalSigns = async () => {
    if (!session || !session.id) return;
    
    try {
      setUpdatingAllVitals(true);
      setUpdatingError(null);
      
      // Collect all vital signs to update
      const updatePromises = [];
      
      // Standard vital signs (not blood pressure)
      ['HEART_RATE', 'OXYGEN_SATURATION', 'RESPIRATORY_RATE', 'TEMPERATURE', 'BLOOD_GLUCOSE', 'PAIN_LEVEL', 'CONSCIOUSNESS'].forEach(type => {
        const vitalData = currentVitalValues[type];
        // Send all values, including empty ones (Nicht gemessen)
        updatePromises.push(
          sessionService.addVitalSign(session.id, {
            type,
            value: vitalData.value || '',
            unit: vitalData.unit
          })
        );
      });
      
      // Special handling for blood pressure
      const bp = currentVitalValues.BLOOD_PRESSURE;
      // Send blood pressure, including empty values (Nicht gemessen)
      updatePromises.push(
        sessionService.addVitalSign(session.id, {
          type: 'BLOOD_PRESSURE',
          value: bp.systolic && bp.diastolic ? `${bp.systolic}/${bp.diastolic}` : '',
          unit: bp.unit
        })
      );
      
      // Execute all updates in parallel
      await Promise.all(updatePromises);
      
      // Show success message
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
      // Turn off edit mode
      setShowEditVitals(false);
      
      // Notify parent component about the update
      if (onVitalSignsUpdated) {
        onVitalSignsUpdated();
      }
    } catch (error) {
      console.error('Error updating vital signs:', error);
      setUpdatingError('Fehler beim Aktualisieren der Vitalwerte.');
    } finally {
      setUpdatingAllVitals(false);
    }
  };

  if (!session) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Vitalwerte
          </Typography>
          
          <Box>
            {/* Show success message when vital signs are updated */}
            {updateSuccess && (
              <Chip
                label="Vitalwerte erfolgreich aktualisiert"
                color="success"
                size="small"
                sx={{ mr: 2 }}
              />
            )}
            
            {/* Toggle button for edit mode */}
            <Button 
              variant={showEditVitals ? "contained" : "outlined"} 
              color="primary"
              onClick={toggleEditMode}
              startIcon={showEditVitals ? <SaveIcon /> : <EditIcon />}
              disabled={updatingAllVitals}
            >
              {showEditVitals ? "Vitalwerte speichern" : "Vitalwerte bearbeiten"}
            </Button>
          </Box>
        </Box>
        
        {/* Show error message if there's an error */}
        {updatingError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updatingError}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Heart Rate */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Herzfrequenz:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.HEART_RATE.value}
                  onChange={(e) => handleDirectVitalChange('HEART_RATE', e.target.value)}
                  displayEmpty
                >
                  {HEART_RATE_OPTIONS.map(option => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={option.isNormal ? { fontWeight: 'bold' } : 
                         option.isLow ? { color: 'error.main' } : 
                         option.isHigh ? { color: 'warning.main' } : {}}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.HEART_RATE.value ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.HEART_RATE.value} {currentVitalValues.HEART_RATE.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'HEART_RATE')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'HEART_RATE').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Blood Pressure */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Blutdruck:
            </Typography>
            
            {showEditVitals ? (
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                '& .MuiFormControl-root': {
                  flex: 1
                },
                '& .MuiInputBase-root': {
                  height: '40px'  // Gleiche Höhe wie andere Dropdowns
                }
              }}>
                <FormControl margin="dense" size="small">
                  <Typography variant="caption" sx={{ mb: 0.5 }}>
                    Systolisch
                  </Typography>
                  <Select
                    value={currentVitalValues.BLOOD_PRESSURE.systolic}
                    onChange={(e) => handleDirectVitalChange('BLOOD_PRESSURE', { name: 'systolic', value: e.target.value })}
                    displayEmpty
                  >
                    {SYSTOLIC_BP_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl margin="dense" size="small">
                  <Typography variant="caption" sx={{ mb: 0.5 }}>
                    Diastolisch
                  </Typography>
                  <Select
                    value={currentVitalValues.BLOOD_PRESSURE.diastolic}
                    onChange={(e) => handleDirectVitalChange('BLOOD_PRESSURE', { name: 'diastolic', value: e.target.value })}
                    displayEmpty
                  >
                    {DIASTOLIC_BP_OPTIONS.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={option.isNormal ? { fontWeight: 'bold' } : 
                           option.isLow ? { color: 'error.main' } : 
                           option.isHigh ? { color: 'warning.main' } : {}}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <>
                {currentVitalValues.BLOOD_PRESSURE.systolic && currentVitalValues.BLOOD_PRESSURE.diastolic ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.BLOOD_PRESSURE.systolic}/{currentVitalValues.BLOOD_PRESSURE.diastolic} {currentVitalValues.BLOOD_PRESSURE.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'BLOOD_PRESSURE')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'BLOOD_PRESSURE').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Oxygen Saturation */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Sauerstoffsättigung:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.OXYGEN_SATURATION.value}
                  onChange={(e) => handleDirectVitalChange('OXYGEN_SATURATION', e.target.value)}
                  displayEmpty
                >
                  {OXYGEN_SATURATION_OPTIONS.map(option => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={option.isNormal ? { fontWeight: 'bold' } : 
                         option.isLow ? { color: 'error.main' } : 
                         option.isHigh ? { color: 'warning.main' } : {}}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.OXYGEN_SATURATION.value ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.OXYGEN_SATURATION.value} {currentVitalValues.OXYGEN_SATURATION.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'OXYGEN_SATURATION')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'OXYGEN_SATURATION').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Respiratory Rate */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Atemfrequenz:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.RESPIRATORY_RATE.value}
                  onChange={(e) => handleDirectVitalChange('RESPIRATORY_RATE', e.target.value)}
                  displayEmpty
                >
                  {RESPIRATORY_RATE_OPTIONS.map(option => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={option.isNormal ? { fontWeight: 'bold' } : 
                         option.isLow ? { color: 'error.main' } : 
                         option.isHigh ? { color: 'warning.main' } : {}}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.RESPIRATORY_RATE.value ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.RESPIRATORY_RATE.value} {currentVitalValues.RESPIRATORY_RATE.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'RESPIRATORY_RATE')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'RESPIRATORY_RATE').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Temperature */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Temperatur:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.TEMPERATURE.value}
                  onChange={(e) => handleDirectVitalChange('TEMPERATURE', e.target.value)}
                  displayEmpty
                >
                  {TEMPERATURE_OPTIONS.map(option => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={option.isNormal ? { fontWeight: 'bold' } : 
                         option.isLow ? { color: 'error.main' } : 
                         option.isHigh ? { color: 'warning.main' } : {}}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.TEMPERATURE.value ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.TEMPERATURE.value} {currentVitalValues.TEMPERATURE.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'TEMPERATURE')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'TEMPERATURE').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Blood Glucose */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Blutzucker:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.BLOOD_GLUCOSE.value}
                  onChange={(e) => handleDirectVitalChange('BLOOD_GLUCOSE', e.target.value)}
                  displayEmpty
                >
                  {BLOOD_GLUCOSE_OPTIONS.map(option => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={option.isNormal ? { fontWeight: 'bold' } : 
                         option.isLow ? { color: 'error.main' } : 
                         option.isHigh ? { color: 'warning.main' } : {}}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.BLOOD_GLUCOSE.value ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.BLOOD_GLUCOSE.value} {currentVitalValues.BLOOD_GLUCOSE.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'BLOOD_GLUCOSE')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'BLOOD_GLUCOSE').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Pain Level */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Schmerzniveau:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.PAIN_LEVEL.value}
                  onChange={(e) => handleDirectVitalChange('PAIN_LEVEL', e.target.value)}
                  displayEmpty
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <MenuItem key={i} value={String(i)}>
                      {i} - {i === 0 ? 'Keine Schmerzen' : i === 10 ? 'Stärkste Schmerzen' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.PAIN_LEVEL.value ? (
                  <>
                    <Typography variant="body2">
                      {currentVitalValues.PAIN_LEVEL.value} {currentVitalValues.PAIN_LEVEL.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'PAIN_LEVEL')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'PAIN_LEVEL').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
          
          {/* Consciousness */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Bewusstseinszustand:
            </Typography>
            
            {showEditVitals ? (
              <FormControl fullWidth margin="dense" size="small">
                <Select
                  value={currentVitalValues.CONSCIOUSNESS.value}
                  onChange={(e) => handleDirectVitalChange('CONSCIOUSNESS', e.target.value)}
                  displayEmpty
                >
                  {CONSCIOUSNESS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {currentVitalValues.CONSCIOUSNESS.value ? (
                  <>
                    <Typography variant="body2">
                      {CONSCIOUSNESS_OPTIONS.find(option => option.value === currentVitalValues.CONSCIOUSNESS.value)?.label || 
                       currentVitalValues.CONSCIOUSNESS.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getLatestVitalSignByType(session.vitalSigns, 'CONSCIOUSNESS')?.timestamp && 
                       new Date(getLatestVitalSignByType(session.vitalSigns, 'CONSCIOUSNESS').timestamp).toLocaleString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nicht gemessen
                  </Typography>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VitalSigns; 