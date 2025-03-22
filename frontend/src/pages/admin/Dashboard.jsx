import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  PeopleOutline,
  EventNote,
  CheckCircleOutline,
  ScheduleOutlined
} from '@mui/icons-material';
import { api as apiService } from '../../services/api';

const StatsCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: `${color}.light`,
            p: 1.5,
            mr: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    completedSessions: 0,
    pendingSessions: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch actual stats from the API
        const response = await apiService.get('/admin/stats');
        
        // If no data is returned, provide default empty values
        const data = response.data || {
          totalUsers: 0,
          activeSessions: 0,
          completedSessions: 0,
          pendingSessions: 0
        };
        
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Statistiken konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Aktualisieren
        </Button>
      </Box>

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
            onClick={() => window.location.reload()}
          >
            Erneut versuchen
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Benutzer"
              value={stats.totalUsers}
              icon={<PeopleOutline sx={{ color: 'primary.main' }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Aktive Sessions"
              value={stats.activeSessions}
              icon={<EventNote sx={{ color: 'success.main' }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Abgeschlossene Sessions"
              value={stats.completedSessions}
              icon={<CheckCircleOutline sx={{ color: 'info.main' }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Wartende Sessions"
              value={stats.pendingSessions}
              icon={<ScheduleOutlined sx={{ color: 'warning.main' }} />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      <Box mt={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Systemübersicht
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Letzten Aktivitäten" />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Keine Aktivitäten gefunden.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Systemstatus" />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Backend API</Typography>
                  <Typography variant="body1" color="success.main">Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Datenbank</Typography>
                  <Typography variant="body1" color="success.main">Verbunden</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Socket.IO</Typography>
                  <Typography variant="body1" color="success.main">Aktiv</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 