import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  KeyboardArrowLeft as BackIcon
} from '@mui/icons-material';
import { changePassword, updateUser } from '../../store/slices/authSlice';
import { usersAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ImageCropper from '../../components/ImageCropper';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, passwordChanged, error } = useSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Only accept JPEG or PNG files
      if (!file.type.includes('jpeg') && !file.type.includes('jpg') && !file.type.includes('png')) {
        setNotification({
          open: true,
          message: 'Nur JPEG und PNG Dateien werden unterstützt',
          severity: 'error'
        });
        return;
      }
      
      // Show cropper dialog
      const imageUrl = URL.createObjectURL(file);
      setProfileImagePreview(imageUrl);
      setOriginalImage(imageUrl);
      setCropperOpen(true);
    }
  };

  // Handle cropper complete
  const handleCropComplete = (cropData) => {
    setProfileImage(cropData.file);
    setProfileImagePreview(cropData.preview);
  };

  // Validate password form
  const validatePasswordForm = () => {
    const validationErrors = {};
    
    if (!passwordData.currentPassword) {
      validationErrors.currentPassword = 'Aktuelles Passwort ist erforderlich';
    }
    
    if (!passwordData.newPassword) {
      validationErrors.newPassword = 'Neues Passwort ist erforderlich';
    } else if (passwordData.newPassword.length < 6) {
      validationErrors.newPassword = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    return validationErrors;
  };

  // Validate profile form
  const validateProfileForm = () => {
    const validationErrors = {};
    
    if (!profileData.firstName) {
      validationErrors.firstName = 'Vorname ist erforderlich';
    }
    
    if (!profileData.lastName) {
      validationErrors.lastName = 'Nachname ist erforderlich';
    }
    
    if (!profileData.email) {
      validationErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      validationErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    return validationErrors;
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    const validationErrors = validateProfileForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // Create form data for profile image upload
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      // Update user profile
      const response = await usersAPI.update(user.id, formData);
      
      // Update user in Redux state
      if (response.data && response.data.user) {
        dispatch(updateUser(response.data.user));
      }
      
      setNotification({
        open: true,
        message: 'Profil erfolgreich aktualisiert',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Fehler beim Aktualisieren des Profils',
        severity: 'error'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    const validationErrors = validatePasswordForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));
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
    navigate('/medic/dashboard');
  };

  // Effect for password change success
  useEffect(() => {
    if (passwordChanged) {
      setNotification({
        open: true,
        message: 'Passwort erfolgreich geändert',
        severity: 'success'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [passwordChanged]);

  // Effect for auth errors
  useEffect(() => {
    if (error) {
      setNotification({
        open: true,
        message: error,
        severity: 'error'
      });
    }
  }, [error]);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Profil-Einstellungen
        </Typography>
      </Box>

      {/* Image cropper dialog */}
      <ImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        image={originalImage}
        onCropComplete={handleCropComplete}
      />

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Persönliche Informationen
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={profileImagePreview || (user?.profileImageUrl || '')}
                sx={{ width: 100, height: 100, mb: 2 }}
                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
              >
                {!profileImagePreview && !user?.profileImageUrl && 
                  `${(user?.firstName?.[0] || '')}`}
              </Avatar>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="profile-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Profilbild ändern
                </Button>
              </label>
            </Box>
            
            <TextField
              fullWidth
              margin="normal"
              label="Vorname"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Nachname"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="E-Mail-Adresse"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveProfile}
                disabled={saveLoading}
              >
                Änderungen speichern
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Password Change */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Passwort ändern
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              margin="normal"
              label="Aktuelles Passwort"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Neues Passwort"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Neues Passwort bestätigen"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Passwort ändern
              </Button>
            </Box>
          </Paper>
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

export default ProfileSettings; 