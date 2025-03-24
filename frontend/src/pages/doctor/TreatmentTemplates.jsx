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
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const TreatmentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates when searchTerm or templates change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    const filtered = templates.filter(template => 
      template.title.toLowerCase().includes(lowerCaseSearch) ||
      template.description?.toLowerCase().includes(lowerCaseSearch) ||
      `${template.createdBy.firstName} ${template.createdBy.lastName}`.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredTemplates(filtered);
  }, [searchTerm, templates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/treatment-templates`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTemplates(response.data);
      setFilteredTemplates(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching treatment templates:", err);
      setError("Fehler beim Laden der Behandlungspläne. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
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
      const updatedTemplates = templates.filter(template => template.id !== id);
      setTemplates(updatedTemplates);
      setFilteredTemplates(
        searchTerm ? 
        updatedTemplates.filter(template => 
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : 
        updatedTemplates
      );
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
      const updatedTemplates = templates.map(template => 
        template.id === id 
          ? { ...template, isFavorite: !isFavorite } 
          : template
      );
      
      setTemplates(updatedTemplates);
      
      // Apply current search filter to updated templates
      if (searchTerm.trim()) {
        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        const filtered = updatedTemplates.filter(template => 
          template.title.toLowerCase().includes(lowerCaseSearch) ||
          template.description?.toLowerCase().includes(lowerCaseSearch) ||
          `${template.createdBy.firstName} ${template.createdBy.lastName}`.toLowerCase().includes(lowerCaseSearch)
        );
        setFilteredTemplates(filtered);
      } else {
        setFilteredTemplates(updatedTemplates);
      }
    } catch (err) {
      console.error("Error toggling favorite status:", err);
      setError("Fehler beim Ändern des Favoriten-Status.");
    }
  };

  // Sort templates - favorited ones first, then by update date
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
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

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Suche nach Behandlungsplänen..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

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
        
        {sortedTemplates.length === 0 && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                {searchTerm 
                  ? "Keine Behandlungspläne gefunden, die Ihrem Suchbegriff entsprechen."
                  : "Keine Behandlungspläne vorhanden. Erstellen Sie Ihren ersten Plan!"
                }
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TreatmentTemplates; 