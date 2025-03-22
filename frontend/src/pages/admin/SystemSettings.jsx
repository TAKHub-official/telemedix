import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { api as apiService } from '../../services/api';

// Real API for system settings
const systemSettingsAPI = {
  getAll: () => {
    return apiService.get('/admin/settings');
  },
  update: (settings) => {
    return apiService.put('/admin/settings', settings);
  },
  create: (setting) => {
    return apiService.post('/admin/settings', setting);
  },
  delete: (key) => {
    return apiService.delete(`/admin/settings/${key}`);
  }
};

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // New setting dialog state
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: ''
  });
  
  // Delete confirmation dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await systemSettingsAPI.getAll();
      setSettings(response.data.settings || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Fehler beim Laden der Systemeinstellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(settings.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Convert settings array to object with key-value pairs
      const settingsObject = settings.reduce((obj, setting) => {
        obj[setting.key] = setting.value;
        return obj;
      }, {});
      
      await systemSettingsAPI.update(settingsObject);
      
      showNotification('Einstellungen erfolgreich gespeichert', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      showNotification('Fehler beim Speichern der Einstellungen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSetting = async () => {
    try {
      if (!newSetting.key || !newSetting.value) {
        showNotification('Schlüssel und Wert sind erforderlich', 'error');
        return;
      }
      
      setSaving(true);
      await systemSettingsAPI.create(newSetting);
      
      // Add to local state
      setSettings([...settings, newSetting]);
      
      // Reset form and close dialog
      setNewSetting({ key: '', value: '', description: '' });
      setOpenNewDialog(false);
      
      showNotification('Einstellung erfolgreich hinzugefügt', 'success');
    } catch (err) {
      console.error('Error adding setting:', err);
      showNotification('Fehler beim Hinzufügen der Einstellung', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (setting) => {
    setSettingToDelete(setting);
    setOpenDeleteDialog(true);
  };

  const handleDeleteSetting = async () => {
    if (!settingToDelete) return;
    
    try {
      setSaving(true);
      await systemSettingsAPI.delete(settingToDelete.key);
      
      // Remove from local state
      setSettings(settings.filter(s => s.key !== settingToDelete.key));
      
      // Close dialog
      setOpenDeleteDialog(false);
      setSettingToDelete(null);
      
      showNotification('Einstellung erfolgreich gelöscht', 'success');
    } catch (err) {
      console.error('Error deleting setting:', err);
      showNotification('Fehler beim Löschen der Einstellung', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Get the appropriate input type based on key name pattern
  const getInputType = (key, value) => {
    if (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY')) {
      return 'password';
    }
    if (key.includes('EMAIL')) {
      return 'email';
    }
    if (key.includes('ENABLED') || value === 'true' || value === 'false') {
      return 'boolean';
    }
    if (!isNaN(Number(value)) && value !== '') {
      return 'number';
    }
    return 'text';
  };

  // Render different input types
  const renderSettingInput = (setting) => {
    const inputType = getInputType(setting.key, setting.value);
    
    switch (inputType) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={setting.value === 'true'}
                onChange={(e) => handleSettingChange(setting.key, e.target.checked ? 'true' : 'false')}
                color="primary"
              />
            }
            label={setting.value === 'true' ? 'Aktiviert' : 'Deaktiviert'}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            variant="outlined"
            size="small"
          />
        );
      default:
        return (
          <TextField
            fullWidth
            type={inputType}
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            variant="outlined"
            size="small"
          />
        );
    }
  };

  const groupSettingsByCategory = () => {
    const groups = {
      'Allgemein': [],
      'Benachrichtigungen': [],
      'Sicherheit': [],
      'Andere': []
    };
    
    settings.forEach(setting => {
      if (setting.key.startsWith('SITE_') || setting.key.includes('EMAIL')) {
        groups['Allgemein'].push(setting);
      } else if (setting.key.includes('NOTIFICATION') || setting.key.includes('TELEGRAM')) {
        groups['Benachrichtigungen'].push(setting);
      } else if (setting.key.includes('PASSWORD') || setting.key.includes('AUTH') || setting.key.includes('SESSION')) {
        groups['Sicherheit'].push(setting);
      } else {
        groups['Andere'].push(setting);
      }
    });
    
    return groups;
  };

  const categoryCards = () => {
    const groups = groupSettingsByCategory();
    
    return Object.entries(groups).map(([category, categorySettings]) => {
      if (categorySettings.length === 0) return null;
      
      return (
        <Card key={category} sx={{ mb: 3 }}>
          <CardHeader title={category} />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {categorySettings.map(setting => (
                <Grid item xs={12} md={6} key={setting.key}>
                  <Box>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                      {setting.key}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {setting.description || 'Keine Beschreibung'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {renderSettingInput(setting)}
                      </Box>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(setting)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      );
    });
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Systemeinstellungen
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            sx={{ mr: 1 }}
            disabled={loading || saving}
          >
            Aktualisieren
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => setOpenNewDialog(true)}
            sx={{ mr: 1 }}
            disabled={loading || saving}
          >
            Neue Einstellung
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading || saving}
          >
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2, color: 'white', borderColor: 'white' }}
            onClick={fetchSettings}
          >
            Erneut versuchen
          </Button>
        </Paper>
      ) : settings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Keine Einstellungen gefunden</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Es wurden noch keine Systemeinstellungen definiert.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setOpenNewDialog(true)}
          >
            Erste Einstellung hinzufügen
          </Button>
        </Paper>
      ) : (
        <Box>
          {categoryCards()}
        </Box>
      )}

      {/* Add New Setting Dialog */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Systemeinstellung</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="key"
                label="Schlüssel"
                value={newSetting.key}
                onChange={(e) => setNewSetting({...newSetting, key: e.target.value.toUpperCase()})}
                fullWidth
                required
                helperText="Schlüssel sollten in GROSSBUCHSTABEN und ohne Leerzeichen sein"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="value"
                label="Wert"
                value={newSetting.value}
                onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Beschreibung"
                value={newSetting.description}
                onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Abbrechen</Button>
          <Button 
            onClick={handleAddSetting} 
            variant="contained" 
            color="primary"
            disabled={!newSetting.key || !newSetting.value}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Einstellung löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie die Einstellung "{settingToDelete?.key}" löschen möchten?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Abbrechen</Button>
          <Button 
            onClick={handleDeleteSetting} 
            variant="contained" 
            color="error"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings; 