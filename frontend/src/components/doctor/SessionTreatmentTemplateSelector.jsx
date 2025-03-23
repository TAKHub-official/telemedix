import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { sessionsAPI, treatmentTemplatesAPI } from '../../services/api';

const SessionTreatmentTemplateSelector = ({ sessionId, onTemplateAssigned, refreshSession }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSelector, setOpenSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [sessionTreatmentTemplate, setSessionTreatmentTemplate] = useState(null);
  const [loadingSessionTemplate, setLoadingSessionTemplate] = useState(true);

  // Fetch existing treatment template for this session
  useEffect(() => {
    const fetchSessionTreatmentTemplate = async () => {
      try {
        setLoadingSessionTemplate(true);
        const response = await sessionsAPI.getSessionTreatmentTemplate(sessionId);
        setSessionTreatmentTemplate(response.data.sessionTreatmentTemplate);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // No template assigned - this is fine
          setSessionTreatmentTemplate(null);
        } else {
          console.error('Error fetching session treatment template:', err);
        }
      } finally {
        setLoadingSessionTemplate(false);
      }
    };

    fetchSessionTreatmentTemplate();
  }, [sessionId]);

  // Fetch available templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await treatmentTemplatesAPI.getAll();
      setTemplates(response.data);
      setFilteredTemplates(response.data);
    } catch (err) {
      console.error('Error fetching treatment templates:', err);
      setError('Fehler beim Laden der Behandlungsvorlagen.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(template => 
        template.title.toLowerCase().includes(query) || 
        (template.description && template.description.toLowerCase().includes(query))
      );
      setFilteredTemplates(filtered);
    }
  };

  // Open template selector dialog
  const handleOpenSelector = () => {
    setOpenSelector(true);
    fetchTemplates();
  };

  // Close template selector dialog
  const handleCloseSelector = () => {
    setOpenSelector(false);
    setSearchQuery('');
    setSelectedTemplate(null);
  };

  // Select a template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id === selectedTemplate ? null : template.id);
  };

  // Assign selected template to session
  const handleAssignTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setAssigning(true);
      await sessionsAPI.assignTreatmentTemplate(sessionId, selectedTemplate);
      
      // Fetch updated session treatment template
      const response = await sessionsAPI.getSessionTreatmentTemplate(sessionId);
      setSessionTreatmentTemplate(response.data.sessionTreatmentTemplate);
      
      if (onTemplateAssigned) {
        onTemplateAssigned(response.data.sessionTreatmentTemplate);
      }
      
      // Refresh the session data if needed
      if (refreshSession) {
        refreshSession();
      }
      
      handleCloseSelector();
    } catch (err) {
      console.error('Error assigning treatment template:', err);
      setError('Fehler beim Zuweisen der Behandlungsvorlage.');
    } finally {
      setAssigning(false);
    }
  };

  // Remove template from session
  const handleRemoveTemplate = async () => {
    try {
      setLoading(true);
      await sessionsAPI.removeTreatmentTemplate(sessionId);
      setSessionTreatmentTemplate(null);
      
      // Refresh the session data if needed
      if (refreshSession) {
        refreshSession();
      }
    } catch (err) {
      console.error('Error removing treatment template:', err);
      setError('Fehler beim Entfernen der Behandlungsvorlage.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status of a template
  const handleToggleFavorite = async (template, e) => {
    e.stopPropagation(); // Prevent selecting the template when clicking the star
    
    try {
      if (template.isFavorite) {
        await treatmentTemplatesAPI.unfavorite(template.id);
      } else {
        await treatmentTemplatesAPI.favorite(template.id);
      }
      
      // Update templates list
      fetchTemplates();
    } catch (err) {
      console.error('Error toggling favorite status:', err);
    }
  };

  // Render the card that shows the current template or allows selection
  const renderTemplateCard = () => {
    if (loadingSessionTemplate) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
            <CircularProgress size={30} />
          </CardContent>
        </Card>
      );
    }

    if (sessionTreatmentTemplate) {
      // Show the assigned template
      const template = sessionTreatmentTemplate.treatmentTemplate;
      const steps = typeof template.steps === 'string' 
        ? JSON.parse(template.steps) 
        : template.steps;
      
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Behandlungsvorlage</Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleOpenSelector}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Ändern
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleRemoveTemplate}
                  size="small"
                  disabled={loading}
                >
                  Entfernen
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                {template.title}
              </Typography>
              
              {template.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
              )}
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Autor:</strong> {template.createdBy.firstName} {template.createdBy.lastName}
              </Typography>
              
              <Typography variant="body2">
                <strong>Schritte:</strong> {steps.length}
              </Typography>
              
              {sessionTreatmentTemplate.status !== 'NEW' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Status:</strong> {
                    sessionTreatmentTemplate.status === 'IN_PROGRESS' ? 'In Bearbeitung' : 
                    sessionTreatmentTemplate.status === 'COMPLETED' ? 'Abgeschlossen' : 
                    sessionTreatmentTemplate.status
                  }
                </Typography>
              )}
              
              {sessionTreatmentTemplate.status !== 'NEW' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Aktueller Schritt:</strong> {sessionTreatmentTemplate.currentStep + 1} von {steps.length}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Show button to add a template
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Behandlungsvorlage</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenSelector}
              startIcon={<AddIcon />}
            >
              Hinzufügen
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Noch keine Behandlungsvorlage für diese Session ausgewählt. 
            Wählen Sie eine Vorlage aus, um eine strukturierte Behandlung zu ermöglichen.
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderTemplateCard()}
      
      {/* Template Selector Dialog */}
      <Dialog
        open={openSelector}
        onClose={handleCloseSelector}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Behandlungsvorlage auswählen</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            placeholder="Suchen..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredTemplates.map(template => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedTemplate === template.id ? '2px solid' : '1px solid',
                      borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                      position: 'relative'
                    }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        color: template.isFavorite ? 'warning.main' : 'action.disabled'
                      }}
                      onClick={(e) => handleToggleFavorite(template, e)}
                    >
                      {template.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                    
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {template.title}
                      </Typography>
                      
                      {template.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {template.description.length > 80
                            ? `${template.description.substring(0, 80)}...`
                            : template.description}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Autor:</strong> {template.createdBy.firstName} {template.createdBy.lastName}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Schritte:</strong> {
                          Array.isArray(template.steps) 
                            ? template.steps.length 
                            : (typeof template.steps === 'string' 
                                ? JSON.parse(template.steps).length 
                                : 0)
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              {filteredTemplates.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center" sx={{ py: 4 }}>
                    Keine Behandlungsvorlagen gefunden.
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSelector}>Abbrechen</Button>
          <Button 
            onClick={handleAssignTemplate} 
            variant="contained" 
            disabled={!selectedTemplate || assigning}
            color="primary"
          >
            {assigning ? <CircularProgress size={24} /> : 'Auswählen'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SessionTreatmentTemplateSelector; 