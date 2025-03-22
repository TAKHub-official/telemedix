import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip, 
  Stack, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { sessionService } from '../../services/sessionService';

const MedicDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0
  });

  // Fetch sessions created by the medic
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sessionService.getSessions();
        const sessions = response.sessions || [];
        
        setSessions(sessions);
        
        // Calculate stats
        const statsData = {
          total: sessions.length,
          open: sessions.filter(s => s.status === 'OPEN').length,
          inProgress: sessions.filter(s => ['ASSIGNED', 'IN_PROGRESS'].includes(s.status)).length,
          completed: sessions.filter(s => s.status === 'COMPLETED').length
        };
        
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Fehler beim Laden der Sessions. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  const handleNewSession = () => {
    navigate('/medic/new-session');
  };

  const handleViewAllSessions = () => {
    navigate('/medic/sessions');
  };

  // Helper function to render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'OPEN':
        return <Chip label="Offen" color="warning" size="small" />;
      case 'ASSIGNED':
        return <Chip label="Zugewiesen" color="info" size="small" />;
      case 'IN_PROGRESS':
        return <Chip label="In Bearbeitung" color="primary" size="small" />;
      case 'COMPLETED':
        return <Chip label="Abgeschlossen" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Helper function to render priority chip
  const renderPriorityChip = (priority) => {
    switch (priority) {
      case 'LOW':
        return <Chip label="Niedrig" color="success" size="small" variant="outlined" />;
      case 'NORMAL':
        return <Chip label="Normal" color="info" size="small" variant="outlined" />;
      case 'HIGH':
        return <Chip label="Hoch" color="error" size="small" />;
      default:
        return <Chip label={priority} size="small" variant="outlined" />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Willkommen, {user?.firstName || 'Medic'}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Hier sehen Sie eine Übersicht Ihrer Sessions und können neue Sessions erstellen.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Gesamt
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Offen
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.open}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalHospitalIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  In Bearbeitung
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Abgeschlossen
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleNewSession}
          size="large"
        >
          Neue Session
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleViewAllSessions}
        >
          Alle Sessions anzeigen
        </Button>
      </Box>
      
      {/* Recent Sessions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Aktuelle Sessions
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : sessions.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            Sie haben noch keine Sessions erstellt. Klicken Sie auf "Neue Session", um zu beginnen.
          </Alert>
        ) : (
          <Box>
            {sessions
              .filter(session => session.status !== 'COMPLETED')
              .slice(0, 5)
              .map((session) => (
                <Card key={session.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate(`/medic/sessions/${session.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" component="div">
                        {session.title}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {renderStatusChip(session.status)}
                        {renderPriorityChip(session.priority)}
                      </Stack>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Session-ID: {session.patientCode}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Erstellt: {new Date(session.createdAt).toLocaleString('de-DE')}
                      </Typography>
                      {session.assignedTo && (
                        <Typography variant="body2" color="text.secondary">
                          Arzt: {session.assignedTo.firstName} {session.assignedTo.lastName}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            
            {sessions.filter(session => session.status !== 'COMPLETED').length > 5 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button onClick={handleViewAllSessions}>
                  Alle aktiven Sessions anzeigen
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MedicDashboard; 