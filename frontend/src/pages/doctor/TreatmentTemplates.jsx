import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const TreatmentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/treatment-templates`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTemplates(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching treatment templates:", err);
      setError("Fehler beim Laden der Behandlungspläne. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Möchten Sie diesen Behandlungsplan wirklich löschen?")) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/treatment-templates/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTemplates(templates.filter(template => template.id !== id));
    } catch (err) {
      console.error("Error deleting treatment template:", err);
      setError("Fehler beim Löschen des Behandlungsplans.");
    }
  };

  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`${API_BASE_URL}/treatment-templates/${id}/favorite`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // Add to favorites
        await axios.post(`${API_BASE_URL}/treatment-templates/${id}/favorite`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      // Update the local state to reflect the change
      setTemplates(templates.map(template => 
        template.id === id 
          ? { ...template, isFavorite: !isFavorite } 
          : template
      ));
    } catch (err) {
      console.error("Error toggling favorite status:", err);
      setError("Fehler beim Ändern des Favoriten-Status.");
    }
  };

  // Sort templates - favorited ones first, then by update date
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // If favorites status is the same, sort by update date
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1">
          Behandlungspläne
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/doctor/treatment-templates/new')}
        >
          Neuer Behandlungsplan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Treatment Plan Cards */}
        {sortedTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Favorite Star */}
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  right: 4, 
                  top: 4,
                  color: template.isFavorite ? 'warning.main' : 'text.secondary'
                }}
                onClick={() => handleToggleFavorite(template.id, template.isFavorite)}
                aria-label={template.isFavorite ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
              >
                {template.isFavorite ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>

              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Autor: {template.createdBy.firstName} {template.createdBy.lastName}
                </Typography>
                {template.description && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {template.description.length > 100 
                      ? `${template.description.substring(0, 100)}...` 
                      : template.description}
                  </Typography>
                )}
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  startIcon={<VisibilityIcon />}
                  size="small"
                  onClick={() => navigate(`/doctor/treatment-templates/${template.id}`)}
                >
                  Ansehen
                </Button>
                
                {template.createdById === user.id && (
                  <>
                    <Button 
                      startIcon={<EditIcon />}
                      size="small"
                      onClick={() => navigate(`/doctor/treatment-templates/${template.id}?edit=true`)}
                    >
                      Bearbeiten
                    </Button>
                    <Button 
                      startIcon={<DeleteIcon />}
                      size="small"
                      color="error"
                      onClick={() => handleDelete(template.id)}
                    >
                      Löschen
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {templates.length === 0 && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Keine Behandlungspläne vorhanden. Erstellen Sie Ihren ersten Plan!
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TreatmentTemplates; 