import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';

const SystemSettings = () => {
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    telegramNotifications: false,
    sessionTimeout: 30,
    maxSessions: 50,
    systemName: 'TeleMedix'
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle settings change
  const handleSettingChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: e.target.type === 'checkbox' ? checked : value
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // TODO: Implement API call to save settings
    showNotification('Einstellungen wurden gespeichert', 'success');
  };

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Systemeinstellungen
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Konfigurieren Sie globale Systemeinstellungen und Benachrichtigungsoptionen
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Benachrichtigungen" />
            <Divider />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="E-Mail-Benachrichtigungen aktivieren"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.telegramNotifications}
                    onChange={handleSettingChange}
                    name="telegramNotifications"
                    color="primary"
                  />
                }
                label="Telegram-Benachrichtigungen aktivieren"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="subtitle2" gutterBottom>
                Hinweis: Telegram-Benachrichtigungen erfordern eine zusätzliche Konfiguration
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Systemkonfiguration" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <TextField
                  name="systemName"
                  label="Systemname"
                  value={settings.systemName}
                  onChange={handleSettingChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  name="sessionTimeout"
                  label="Session-Timeout (Minuten)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={handleSettingChange}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 5, max: 120 } }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  name="maxSessions"
                  label="Maximale aktive Sessions"
                  type="number"
                  value={settings.maxSessions}
                  onChange={handleSettingChange}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 10, max: 500 } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveSettings}
            >
              Einstellungen speichern
            </Button>
          </Box>
        </Grid>
      </Grid>

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