import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const TreatmentTemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id) && (location.search.includes('edit=true') || !id);
  const isViewMode = Boolean(id) && !location.search.includes('edit=true');
  const isNewMode = !id;
  
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [template, setTemplate] = useState({
    title: '',
    description: '',
    steps: [],
    variables: [],
    isPublic: true
  });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState(null);
  
  // Load template data when in edit or view mode
  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/treatment-templates/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Parse JSON strings if they are stored as strings
      const templateData = {
        ...response.data,
        steps: typeof response.data.steps === 'string' 
          ? JSON.parse(response.data.steps) 
          : response.data.steps,
        variables: response.data.variables && typeof response.data.variables === 'string' 
          ? JSON.parse(response.data.variables) 
          : response.data.variables || []
      };
      
      setTemplate(templateData);
      
      // Only allow editing if user is the creator
      if (response.data.createdById !== user.id && location.search.includes('edit=true')) {
        setError("Sie sind nicht berechtigt, diesen Behandlungsplan zu bearbeiten.");
        navigate(`/doctor/treatment-templates/${id}`); // Redirect to view mode
      }
    } catch (err) {
      console.error("Error fetching treatment template:", err);
      setError("Fehler beim Laden des Behandlungsplans.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template.title) {
      setError("Bitte geben Sie einen Titel ein.");
      return;
    }
    
    if (template.steps.length === 0) {
      setError("Bitte fügen Sie mindestens einen Behandlungsschritt hinzu.");
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data (convert arrays to JSON strings)
      const templateData = {
        ...template,
        steps: JSON.stringify(template.steps),
        variables: JSON.stringify(template.variables)
      };
      
      let response;
      if (isNewMode) {
        response = await axios.post(`${API_BASE_URL}/treatment-templates`, templateData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        response = await axios.put(`${API_BASE_URL}/treatment-templates/${id}`, templateData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      navigate('/doctor/treatment-templates');
    } catch (err) {
      console.error("Error saving treatment template:", err);
      setError("Fehler beim Speichern des Behandlungsplans.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplate({ ...template, [name]: value });
  };

  const handleSwitchChange = (e) => {
    setTemplate({ ...template, isPublic: e.target.checked });
  };

  // Step management functions
  const handleAddStep = (index = -1) => {
    const newStep = {
      title: `Schritt ${template.steps.length + 1}`,
      content: ''
    };
    
    const newSteps = [...template.steps];
    if (index === -1) {
      // Add to the end
      newSteps.push(newStep);
    } else {
      // Add after the specified index
      newSteps.splice(index + 1, 0, newStep);
      
      // Update step titles to maintain sequence
      for (let i = index + 2; i < newSteps.length; i++) {
        if (newSteps[i].title.startsWith('Schritt ')) {
          newSteps[i].title = `Schritt ${i + 1}`;
        }
      }
    }
    
    setTemplate({ ...template, steps: newSteps });
  };

  const handleStepTitleChange = (index, value) => {
    const newSteps = [...template.steps];
    newSteps[index] = { ...newSteps[index], title: value };
    setTemplate({ ...template, steps: newSteps });
  };

  const handleStepContentChange = (index, value) => {
    const newSteps = [...template.steps];
    newSteps[index] = { ...newSteps[index], content: value };
    setTemplate({ ...template, steps: newSteps });
  };

  const handleDeleteStep = (index) => {
    setStepToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStep = () => {
    const newSteps = template.steps.filter((_, i) => i !== stepToDelete);
    
    // Update step titles to maintain sequence
    for (let i = stepToDelete; i < newSteps.length; i++) {
      if (newSteps[i].title.startsWith('Schritt ')) {
        newSteps[i].title = `Schritt ${i + 1}`;
      }
    }
    
    setTemplate({ ...template, steps: newSteps });
    setDeleteDialogOpen(false);
    setStepToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Header with breadcrumbs */}
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            underline="hover" 
            color="inherit" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/doctor/treatment-templates')}
          >
            Behandlungspläne
          </Link>
          <Typography color="text.primary">
            {isNewMode ? 'Neuer Plan' : template.title}
          </Typography>
        </Breadcrumbs>
        
        <Box display="flex" alignItems="center" mt={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/doctor/treatment-templates')}
            sx={{ mr: 2 }}
            variant="outlined"
          >
            Zurück
          </Button>
          
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {isNewMode ? 'Neuen Behandlungsplan erstellen' : 
              isEditMode ? 'Behandlungsplan bearbeiten' : 'Behandlungsplan ansehen'}
          </Typography>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Name and description */}
      <Box mb={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Name des Behandlungsplans
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          name="title"
          placeholder="Hier Name eingeben..."
          value={template.title}
          onChange={handleInputChange}
          disabled={isViewMode}
          InputProps={{
            sx: { 
              borderRadius: 1,
              bgcolor: 'background.paper'
            }
          }}
        />
      </Box>

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2">
          Beschreibung
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              checked={template.isPublic} 
              onChange={handleSwitchChange}
              disabled={isViewMode}
            />
          }
          label="Öffentlich (für andere Ärzte sichtbar)"
        />
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        name="description"
        placeholder="Kurze Beschreibung des Plans..."
        value={template.description || ''}
        onChange={handleInputChange}
        disabled={isViewMode}
        multiline
        rows={2}
        sx={{ mb: 4 }}
        InputProps={{
          sx: { 
            borderRadius: 1,
            bgcolor: 'background.paper'
          }
        }}
      />

      {/* Steps section */}
      {template.steps.map((step, index) => (
        <Box key={index} mb={2}>
          <Card variant="outlined" sx={{ borderRadius: 1, mb: 1, position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
              {!isViewMode && (
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDeleteStep(index)}
                  aria-label="delete step"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            <CardContent>
              <TextField
                fullWidth
                variant="standard"
                value={step.title}
                onChange={(e) => handleStepTitleChange(index, e.target.value)}
                disabled={isViewMode}
                InputProps={{
                  disableUnderline: isViewMode,
                  sx: { 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    mb: 2
                  }
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Hier Text eingeben..."
                value={step.content}
                onChange={(e) => handleStepContentChange(index, e.target.value)}
                disabled={isViewMode}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 1
                  }
                }}
              />
            </CardContent>
          </Card>
          
          {/* Add button between steps, only if not in view mode */}
          {!isViewMode && (
            <Box display="flex" justifyContent="center">
              <IconButton
                color="primary"
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  borderRadius: 1
                }}
                onClick={() => handleAddStep(index)}
              >
                <AddIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}
      
      {/* Initial add button if no steps yet */}
      {template.steps.length === 0 && !isViewMode && (
        <Box textAlign="center" mb={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleAddStep()}
            sx={{ borderRadius: 1 }}
          >
            Schritt hinzufügen
          </Button>
        </Box>
      )}
      
      {/* Save button at the bottom */}
      <Box my={4} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleSave}
          disabled={isViewMode || saving}
          sx={{ 
            py: 1.5, 
            borderRadius: 1,
            fontSize: '1.1rem'
          }}
        >
          {saving ? 'Wird gespeichert...' : 'Behandlungsplan speichern'}
        </Button>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Schritt löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie diesen Schritt wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={confirmDeleteStep} color="error" autoFocus>
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TreatmentTemplateEditor; 