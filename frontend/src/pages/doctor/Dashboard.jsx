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
  Tab,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
  VisibilityOutlined as ViewIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../../services/api';

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeSessions: 0,
    pendingSessions: 0,
    completedToday: 0,
    notificationCount: 0
  });
  const [sessions, setSessions] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sessions from the API
      // Note: Removing params for now to ensure it works with the current backend
      const response = await sessionsAPI.getAll();
      
      if (!response || !response.data) {
        throw new Error('Invalid API response structure');
      }
      
      const sessionData = response.data;
      console.log('Session data:', sessionData);
      
      // Set sessions - using the sessions array from the response
      const sessionsArray = sessionData.sessions || [];
      setSessions(sessionsArray);
      
      // Calculate stats from the response data
      const activeSessions = sessionsArray.filter(session => session.status === 'ACTIVE').length;
      const pendingSessions = sessionsArray.filter(session => session.status === 'OPEN').length;
      const completedToday = sessionsArray.filter(session => {
        if (!session.updatedAt) return false;
        
        const today = new Date().toISOString().split('T')[0];
        const sessionDate = new Date(session.updatedAt).toISOString().split('T')[0];
        return session.status === 'COMPLETED' && sessionDate === today;
      }).length;
      
      setStats({
        activeSessions,
        pendingSessions,
        completedToday,
        notificationCount: pendingSessions // Use pending sessions as notification count for now
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Fehler beim Laden der Dashboard-Daten. Bitte versuchen Sie es später erneut.');
      
      // Set empty sessions to prevent other errors
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle session view
  const handleViewSession = (sessionId) => {
    navigate(`/doctor/sessions/${sessionId}`);
  };

  // Handle session accept
  const handleAcceptSession = async (sessionId) => {
    try {
      setLoading(true);
      
      // Get the current user ID from auth state
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const doctorId = currentUser?.id;
      
      if (!doctorId) {
        throw new Error('Arzt-ID nicht gefunden');
      }
      
      console.log('Assigning session to doctor ID:', doctorId);
      
      // Assign the session to the current doctor
      // Make sure we're passing the doctorId parameter correctly
      await sessionsAPI.assign(sessionId, doctorId);
      
      // Refresh data
      await loadDashboardData();
      
    } catch (err) {
      console.error('Error accepting session:', err);
      setError('Fehler beim Akzeptieren der Session. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData();
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
    if (!dateString) return '';
    
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
                {loading ? (
                  <Skeleton variant="text" width={40} height={40} />
                ) : (
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.activeSessions}
                  </Typography>
                )}
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
                {loading ? (
                  <Skeleton variant="text" width={40} height={40} />
                ) : (
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.pendingSessions}
                  </Typography>
                )}
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
                {loading ? (
                  <Skeleton variant="text" width={40} height={40} />
                ) : (
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.completedToday}
                  </Typography>
                )}
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
              <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                <NotificationsIcon />
              </Avatar>
              <Box>
                {loading ? (
                  <Skeleton variant="text" width={40} height={40} />
                ) : (
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.notificationCount}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Neue Benachrichtigungen
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render session list
  const renderSessionList = () => {
    if (loading && sessions.length === 0) {
      return (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {Array(3).fill(0).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={`skeleton-${index}`}>
              <Card>
                <CardHeader
                  title={<Skeleton variant="text" width="70%" />}
                  subheader={<Skeleton variant="text" width="40%" />}
                />
                <Divider />
                <CardContent>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={80} height={30} />
                  <Skeleton variant="rectangular" width={80} height={30} sx={{ ml: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    // Guard against null or undefined sessions
    if (!sessions || sessions.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Keine Sessions gefunden.
        </Alert>
      );
    }

    const filteredSessions = sessions.filter(session => {
      if (!session) return false;
      
      // Filter based on tab value
      if (tabValue === 0) return true; // All sessions
      if (tabValue === 1) return session.status === 'ACTIVE'; // Active
      if (tabValue === 2) return session.status === 'OPEN'; // Changed from 'PENDING' to 'OPEN'
      return false;
    });

    if (filteredSessions.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Keine Sessions gefunden.
        </Alert>
      );
    }

    // Only show up to 6 sessions on the dashboard
    const limitedSessions = filteredSessions.slice(0, 6);

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {limitedSessions.map((session) => (
          <Grid item xs={12} md={6} lg={4} key={session.id || Math.random()}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="h6" component="div">
                    {session.patientCode || 'Unbenannter Patient'}
                  </Typography>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(session.createdAt)}
                    </Typography>
                  </Box>
                }
                action={
                  <Chip 
                    label={getPriorityLabel(session.priority)} 
                    color={getPriorityColor(session.priority)}
                    size="small"
                  />
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ mb: 1.5 }}>
                  {/* Extract patient data from medicalRecord if available */}
                  {(() => {
                    // Try to parse the patientHistory from medicalRecord if it exists
                    let patientData = {};
                    if (session.medicalRecord && session.medicalRecord.patientHistory) {
                      try {
                        // Handle case where patientHistory might already be an object or a JSON string
                        if (typeof session.medicalRecord.patientHistory === 'string') {
                          patientData = JSON.parse(session.medicalRecord.patientHistory);
                        } else {
                          // If it's already an object, use it directly
                          patientData = session.medicalRecord.patientHistory;
                        }
                      } catch (e) {
                        console.error('Failed to parse patient history:', e);
                      }
                    }
                    
                    return (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Alter:</strong> {patientData.age || 'Unbekannt'} Jahre
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Geschlecht:</strong> {patientData.gender || 'Nicht angegeben'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Medic:</strong> {session.createdBy?.name || 'Nicht zugewiesen'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Hauptbeschwerde:</strong> {patientData.chiefComplaint || 'Keine Angaben'}
                        </Typography>
                      </>
                    );
                  })()}
                </Box>
                
                {session.vitalSigns && session.vitalSigns.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Vitalwerte:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2" align="center">
                          <strong>Puls</strong>
                          <Box>{session.vitalSigns[0]?.value || '—'} {session.vitalSigns[0]?.unit || ''}</Box>
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" align="center">
                          <strong>RR</strong>
                          <Box>{session.vitalSigns[1]?.value || '—'} {session.vitalSigns[1]?.unit || ''}</Box>
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" align="center">
                          <strong>SpO₂</strong>
                          <Box>{session.vitalSigns[2]?.value || '—'} {session.vitalSigns[2]?.unit || ''}</Box>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={() => handleViewSession(session.id)}
                >
                  Ansehen
                </Button>
                {session.status === 'OPEN' && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleAcceptSession(session.id)}
                  >
                    Annehmen
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button 
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStatsCards()}

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Aktuelle Sessions
          </Typography>
          <Button onClick={() => navigate('/doctor/sessions')}>
            Alle anzeigen
          </Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="session tabs">
            <Tab label="Alle" />
            <Tab label="Aktiv" />
            <Tab label="Wartend" />
          </Tabs>
        </Box>
        
        {renderSessionList()}
      </Box>
    </Box>
  );
};

export default DoctorDashboard; 