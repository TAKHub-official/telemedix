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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  PeopleOutline,
  EventNote,
  CheckCircleOutline,
  ScheduleOutlined,
  PersonOutline,
  MedicalServices,
  AdminPanelSettings,
  ArrowForward
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { adminAPI } from '../../services/api';

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

const DetailStatsCard = ({ title, data, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader 
      title={title}
      avatar={
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          {icon}
        </Avatar>
      }
    />
    <Divider />
    <CardContent>
      <List dense>
        {data.map((item, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
                {item.icon || icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={item.label} 
              secondary={
                <Typography variant="body1" component="span" fontWeight="bold">
                  {item.value}
                </Typography>
              } 
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const ActivityItem = ({ title, time, description, icon, color = 'primary' }) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
        {icon}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="subtitle1" component="span">
          {title}
        </Typography>
      }
      secondary={
        <>
          <Typography component="span" variant="body2" color="text.primary">
            {time}
          </Typography>
          {" — "}{description}
        </>
      }
    />
  </ListItem>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    usersByRole: {
      ADMIN: 0,
      DOCTOR: 0,
      MEDIC: 0
    },
    sessionsByPriority: {
      LOW: 0,
      NORMAL: 0,
      HIGH: 0,
      URGENT: 0
    },
    sessionsTrend: [],
    recentActivities: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch detailed stats from the API
        const response = await adminAPI.getDetailedStats();
        
        // If no data is returned, provide default empty values
        const data = response.data || {
          totalUsers: 0,
          activeSessions: 0,
          completedSessions: 0,
          pendingSessions: 0,
          usersByRole: {
            ADMIN: 0,
            DOCTOR: 0,
            MEDIC: 0
          },
          sessionsByPriority: {
            LOW: 0,
            NORMAL: 0,
            HIGH: 0,
            URGENT: 0
          },
          sessionsTrend: [],
          recentActivities: []
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
        <>
          {/* Main Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
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

          {/* Detailed Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <DetailStatsCard
                title="Benutzer nach Rolle"
                icon={<PersonOutline />}
                color="primary"
                data={[
                  { 
                    label: "Administratoren", 
                    value: stats.usersByRole.ADMIN,
                    icon: <AdminPanelSettings />
                  },
                  { 
                    label: "Ärzte", 
                    value: stats.usersByRole.DOCTOR,
                    icon: <MedicalServices />
                  },
                  { 
                    label: "Sanitäter", 
                    value: stats.usersByRole.MEDIC,
                    icon: <PersonOutline />
                  }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DetailStatsCard
                title="Sessions nach Priorität"
                icon={<EventNote />}
                color="success"
                data={[
                  { label: "Niedrig", value: stats.sessionsByPriority.LOW },
                  { label: "Normal", value: stats.sessionsByPriority.NORMAL },
                  { label: "Hoch", value: stats.sessionsByPriority.HIGH },
                  { label: "Dringend", value: stats.sessionsByPriority.URGENT }
                ]}
              />
            </Grid>
            
            {/* Add session trend chart */}
            {stats.sessionsTrend && stats.sessionsTrend.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Sessions-Trend der letzten 7 Tage" />
                  <Divider />
                  <CardContent sx={{ height: 300 }}>
                    {/* A placeholder for where you'd implement a chart */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Hier wird ein Chart für den Sessions-Trend eingefügt.
                    </Typography>
                    <Box sx={{ display: 'flex', height: 240, px: 2 }}>
                      {stats.sessionsTrend.map((day, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            flex: 1 
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: '70%', 
                              bgcolor: 'primary.main', 
                              height: `${Math.max(20, (day.count / Math.max(...stats.sessionsTrend.map(d => d.count)) * 200))}px` 
                            }} 
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {new Date(day.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}

      <Box mt={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Letzte Aktivitäten
          </Typography>
          <Button 
            component={RouterLink} 
            to="/admin/logs" 
            color="primary" 
            endIcon={<ArrowForward />}
          >
            Alle anzeigen
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper>
              <List>
                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id || index}>
                      <ActivityItem
                        title={activity.title}
                        time={activity.time}
                        description={activity.description}
                        icon={
                          activity.type === 'USER' ? <PeopleOutline /> : 
                          activity.type === 'SESSION' ? <EventNote /> : 
                          <CheckCircleOutline />
                        }
                        color={
                          activity.action === 'CREATE' ? 'success' : 
                          activity.action === 'UPDATE' ? 'info' : 
                          activity.action === 'DELETE' ? 'error' : 
                          'primary'
                        }
                      />
                      {index < stats.recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="Keine Aktivitäten gefunden" 
                      secondary="Die Aktivitäten werden angezeigt, sobald Benutzeraktionen stattfinden"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Systemübersicht
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Schnellzugriff" />
              <Divider />
              <CardContent>
                <List>
                  <ListItem button component={RouterLink} to="/admin/users">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <PeopleOutline color="primary" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Benutzerverwaltung" 
                      secondary="Benutzer erstellen, bearbeiten und verwalten" 
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem button component={RouterLink} to="/admin/logs">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.light' }}>
                        <EventNote color="info" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Systemprotokolle" 
                      secondary="Benutzeraktivitäten und Systemereignisse einsehen" 
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem button component={RouterLink} to="/admin/settings">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light' }}>
                        <ScheduleOutlined color="warning" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Systemeinstellungen" 
                      secondary="Globale Einstellungen und Konfigurationen verwalten" 
                    />
                  </ListItem>
                </List>
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