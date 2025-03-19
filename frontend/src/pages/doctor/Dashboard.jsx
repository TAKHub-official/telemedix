import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Chip,
  Divider,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  CircularProgress,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
  VisibilityOutlined as ViewIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api as apiService } from '../../services/api';

// Mock data for dashboard statistics
const mockStats = {
  activeSessions: 3,
  pendingSessions: 2,
  completedToday: 5,
  notificationCount: 4
};

// Mock data for session cards
const mockSessions = [
  {
    id: 'sess-001',
    patientName: 'Max Mustermann',
    age: 45,
    priority: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2025-03-19T10:30:00Z',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    },
    symptoms: ['Brustschmerzen', 'Kurzatmigkeit'],
    vitalSigns: {
      heartRate: 95,
      bloodPressure: '140/90',
      oxygenSaturation: 94
    }
  },
  {
    id: 'sess-002',
    patientName: 'Anna Schmidt',
    age: 32,
    priority: 'MEDIUM',
    status: 'ACTIVE',
    createdAt: '2025-03-19T11:15:00Z',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    },
    symptoms: ['Kopfschmerzen', 'Schwindel'],
    vitalSigns: {
      heartRate: 78,
      bloodPressure: '125/85',
      oxygenSaturation: 97
    }
  },
  {
    id: 'sess-003',
    patientName: 'Julia Weber',
    age: 28,
    priority: 'LOW',
    status: 'PENDING',
    createdAt: '2025-03-19T11:45:00Z',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    },
    symptoms: ['Halsschmerzen', 'Fieber'],
    vitalSigns: {
      heartRate: 88,
      bloodPressure: '120/80',
      oxygenSaturation: 98
    }
  }
];

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(mockStats);
  const [sessions, setSessions] = useState(mockSessions);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch data from the API
        // For now, we'll simulate an API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setStats(mockStats);
        setSessions(mockSessions);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Fehler beim Laden der Dashboard-Daten');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle session view
  const handleViewSession = (sessionId) => {
    navigate(`/doctor/sessions/${sessionId}`);
  };

  // Handle session accept
  const handleAcceptSession = (sessionId) => {
    // In real implementation, this would update the session status in the backend
    console.log('Accepting session:', sessionId);
    
    // Update local state to reflect the change
    setSessions(
      sessions.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'ACTIVE' } 
          : session
      )
    );
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Hoch';
      case 'MEDIUM':
        return 'Mittel';
      case 'LOW':
        return 'Niedrig';
      default:
        return priority;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ', ' + date.toLocaleDateString('de-DE');
  };

  // Render stats cards
  const renderStatsCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <MedicalServicesIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stats.activeSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktive Sessions
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                <AccessTimeIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stats.pendingSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wartende Sessions
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stats.completedToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Abgeschlossen heute
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Badge badgeContent={stats.notificationCount} color="error">
                <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                  <NotificationsIcon />
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stats.notificationCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Benachrichtigungen
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render session cards
  const renderSessionList = () => {
    // Filter sessions based on active tab
    const filteredSessions = tabValue === 0 
      ? sessions.filter(s => s.status === 'ACTIVE')
      : tabValue === 1
      ? sessions.filter(s => s.status === 'PENDING')
      : sessions;

    return (
      <List>
        {filteredSessions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Keine Sessions gefunden
            </Typography>
          </Paper>
        ) : (
          filteredSessions.map(session => (
            <Paper key={session.id} sx={{ mb: 2 }}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" component="span">
                        {session.patientName}, {session.age}
                      </Typography>
                      <Chip 
                        label={getPriorityLabel(session.priority)} 
                        color={getPriorityColor(session.priority)} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="text.primary">
                        Seit: {formatDate(session.createdAt)}
                      </Typography>
                      <Typography variant="body2" display="block">
                        Medic: {session.medic.name}
                      </Typography>
                      <Typography variant="body2" display="block">
                        Symptome: {session.symptoms.join(', ')}
                      </Typography>
                      <Box mt={1}>
                        <Chip 
                          label={`Puls: ${session.vitalSigns.heartRate}`} 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          label={`Blutdruck: ${session.vitalSigns.bloodPressure}`} 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          label={`SpO₂: ${session.vitalSigns.oxygenSaturation}%`} 
                          size="small" 
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewSession(session.id)}
                      sx={{ mt: 1, mb: 1 }}
                    >
                      Details
                    </Button>
                    {session.status === 'PENDING' && (
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleAcceptSession(session.id)}
                        sx={{ mt: 1, mb: 1, ml: 1 }}
                      >
                        Annehmen
                      </Button>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))
        )}
      </List>
    );
  };

  // Main render
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Arzt-Dashboard
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
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
        <Box>
          {/* Stats Section */}
          <Box mb={4}>
            {renderStatsCards()}
          </Box>

          {/* Sessions Section */}
          <Box>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
              Meine Sessions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ mb: 2 }}
            >
              <Tab label="Aktiv" />
              <Tab label="Wartend" />
              <Tab label="Alle" />
            </Tabs>
            
            {renderSessionList()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DoctorDashboard; 