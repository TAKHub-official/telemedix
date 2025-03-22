import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  Save as SaveIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
  KeyboardArrowLeft as BackIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import { usersAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [notificationMethod, setNotificationMethod] = useState('email');
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    email: '',
  });
  const [telegramSettings, setTelegramSettings] = useState({
    enabled: false,
    username: ''
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Load notification settings on component mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        setInitialLoading(true);
        // Load user notification settings from backend
        // For now, we'll just populate with user email as placeholder
        if (user) {
          setEmailSettings({
            enabled: user.emailNotificationsEnabled || false,
            email: user.email || '',
          });
          
          setTelegramSettings({
            enabled: user.telegramNotificationsEnabled || false,
            username: user.telegramUsername || '',
          });
          
          // Set default notification method based on what's enabled
          if (user.telegramNotificationsEnabled) {
            setNotificationMethod('telegram');
          } else {
            setNotificationMethod('email');
          }
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
        setNotification({
          open: true,
          message: 'Fehler beim Laden der Benachrichtigungseinstellungen',
          severity: 'error'
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadNotificationSettings();
  }, [user]);

  // Handle notification method change
  const handleMethodChange = (event) => {
    setNotificationMethod(event.target.value);
    
    // Enable the selected method and disable the other one
    if (event.target.value === 'email') {
      setEmailSettings({ ...emailSettings, enabled: true });
      setTelegramSettings({ ...telegramSettings, enabled: false });
    } else {
      setEmailSettings({ ...emailSettings, enabled: false });
      setTelegramSettings({ ...telegramSettings, enabled: true });
    }
  };

  // Handle email settings change
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };

  // Handle telegram settings change
  const handleTelegramChange = (e) => {
    const { name, value } = e.target;
    setTelegramSettings({
      ...telegramSettings,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const validationErrors = {};
    
    if (notificationMethod === 'email') {
      if (!emailSettings.email) {
        validationErrors.email = 'E-Mail-Adresse ist erforderlich';
      } else if (!/\S+@\S+\.\S+/.test(emailSettings.email)) {
        validationErrors.email = 'Ungültige E-Mail-Adresse';
      }
    } else if (notificationMethod === 'telegram') {
      if (!telegramSettings.username) {
        validationErrors.telegramUsername = 'Telegram-Nutzername ist erforderlich';
      }
    }
    
    return validationErrors;
  };

  // Handle save notification settings
  const handleSaveSettings = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create object with notification settings
      const notificationSettings = {
        emailNotificationsEnabled: notificationMethod === 'email' && emailSettings.enabled,
        telegramNotificationsEnabled: notificationMethod === 'telegram' && telegramSettings.enabled,
        email: emailSettings.email,
        telegramUsername: telegramSettings.username
      };
      
      // Update user notification settings
      await usersAPI.updateNotificationSettings(user.id, notificationSettings);
      
      setNotification({
        open: true,
        message: 'Benachrichtigungseinstellungen erfolgreich aktualisiert',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Fehler beim Aktualisieren der Benachrichtigungseinstellungen',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle back button
  const handleBack = () => {
    navigate('/doctor/dashboard');
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Zurück zum Dashboard
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Benachrichtigungseinstellungen
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Benachrichtigungsmethode
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Wählen Sie Ihre bevorzugte Benachrichtigungsmethode:</FormLabel>
              <RadioGroup
                name="notificationMethod"
                value={notificationMethod}
                onChange={handleMethodChange}
              >
                <FormControlLabel 
                  value="email" 
                  control={<Radio />} 
                  label="E-Mail-Benachrichtigungen" 
                />
                <FormControlLabel 
                  value="telegram" 
                  control={<Radio />} 
                  label="Telegram-Benachrichtigungen" 
                />
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 4 }}>
              {notificationMethod === 'email' ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    E-Mail-Einstellungen
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="E-Mail-Adresse für Benachrichtigungen"
                    name="email"
                    type="email"
                    value={emailSettings.email}
                    onChange={handleEmailChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Telegram-Einstellungen
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Telegram-Nutzername"
                    name="username"
                    value={telegramSettings.username}
                    onChange={handleTelegramChange}
                    error={Boolean(errors.telegramUsername)}
                    helperText={errors.telegramUsername || 'Geben Sie Ihren Telegram-Nutzernamen ein (ohne @)'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TelegramIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                Einstellungen speichern
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Über Benachrichtigungen"
              avatar={<NotificationIcon color="primary" />}
            />
            <CardContent>
              <Typography variant="body2" paragraph>
                Benachrichtigungen informieren Sie in Echtzeit über neue Szenen und andere wichtige Ereignisse.
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                E-Mail-Benachrichtigungen
              </Typography>
              <Typography variant="body2" paragraph>
                Erhalten Sie Benachrichtigungen per E-Mail, wenn neue Szenen gestartet werden. Sie können die E-Mail-Adresse angeben, an die die Benachrichtigungen geschickt werden sollen.
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Telegram-Benachrichtigungen
              </Typography>
              <Typography variant="body2" paragraph>
                Als Alternative zu E-Mail-Benachrichtigungen können Sie auch Benachrichtigungen über Telegram erhalten. Geben Sie dazu Ihren Telegram-Nutzernamen ein.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Um Telegram-Benachrichtigungen zu erhalten, müssen Sie zuerst den TeleMedix-Bot kontaktieren und einen Chat starten.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettings; 