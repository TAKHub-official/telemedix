import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

function TestConnection() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    try {
      // Use the environment variable for API URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${apiUrl}/health`);
      setMessage(JSON.stringify(response.data, null, 2));
      setStatus('success');
    } catch (error) {
      console.error('Backend connection test failed:', error);
      let errorMessage = 'Backend connection error: ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response received from server. Is the backend running?';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }
      
      setMessage(errorMessage);
      setStatus('error');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Backend Connection Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testConnection}
        disabled={status === 'loading'}
        sx={{ mb: 2 }}
      >
        {status === 'loading' ? <CircularProgress size={24} /> : 'Test Backend Connection'}
      </Button>
      
      {status !== 'idle' && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: status === 'success' ? '#e8f5e9' : status === 'error' ? '#ffebee' : '#f5f5f5',
          borderRadius: 1,
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          maxHeight: 300
        }}>
          <Typography variant="body2" component="pre">
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default TestConnection; 