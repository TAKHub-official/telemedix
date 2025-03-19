import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { login, clearError } from '../store/slices/authSlice';
import TestConnection from '../components/common/TestConnection';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!email) {
      errors.email = 'E-Mail ist erforderlich';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'E-Mail-Format ist ungültig';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Passwort ist erforderlich';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Clear any authentication errors when the user starts typing
  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3, 
          flexDirection: 'column'
        }}>
          <MedicalServicesIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
            TeleMedix
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
            Bringing Doctors Closer
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-Mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleInputChange();
            }}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Passwort"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, height: 48 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Anmelden'}
          </Button>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Testbenutzer:<br />
            Admin: admin@telemedix.com / admin123<br />
            Arzt: dr.mueller@telemedix.com / doctor123<br />
            Medic: medic.wagner@telemedix.com / medic123
          </Typography>
        </Box>
      </Paper>
      
      {/* Test connection component for debugging */}
      <TestConnection />
    </Container>
  );
}

export default Login; 