import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        
        <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: { xs: '4rem', md: '6rem' } }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" sx={{ mb: 4 }}>
          Seite nicht gefunden
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 600 }}>
          Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
          Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          Zur Startseite
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound; 