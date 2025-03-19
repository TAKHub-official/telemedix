import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useSelector } from 'react-redux';

const TestPage = () => {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#e8f5e9' }}>
        <Typography variant="h4" component="h1" gutterBottom color="success.main">
          Anmeldung erfolgreich!
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          Willkommen, Dr. {user?.lastName || 'Müller'}!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Sie sind erfolgreich als Arzt angemeldet.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Benutzerdetails:
        </Typography>
        
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </Paper>
      
      <Typography variant="body1" paragraph>
        Diese vereinfachte Seite dient zum Testen der Authentifizierung.
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        In der vollständigen Anwendung würden hier die Doktor-Funktionen angezeigt werden.
      </Typography>
    </Box>
  );
};

export default TestPage; 