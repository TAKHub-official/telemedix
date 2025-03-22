import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Stack, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { sessionService } from '../../services/sessionService';
import { getSocket, joinSessionRoom, leaveSessionRoom } from '../../services/socket';

const MedicSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch sessions created by the medic
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sessionService.getSessions();
        setSessions(response.sessions || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Fehler beim Laden der Sessions. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);
  
  // Set up socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    
    // Listen for session updates
    socket.on('sessionUpdate', (data) => {
      if (data.type === 'STATUS_CHANGE') {
        // Update the session in the list
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === data.session.id ? { ...session, ...data.session } : session
          )
        );
        
        // Show notification
        setNotification({
          open: true,
          message: `Session "${data.session.title}" Status wurde aktualisiert auf ${getStatusLabel(data.session.status)}`,
          severity: 'info'
        });
      }
    });
    
    // Listen for notifications
    socket.on('notification', (data) => {
      if (data.type === 'SESSION_STATUS') {
        setNotification({
          open: true,
          message: data.content,
          severity: 'info'
        });
      }
    });
    
    // Join rooms for all sessions
    sessions.forEach(session => {
      joinSessionRoom(session.id);
    });
    
    // Cleanup
    return () => {
      socket.off('sessionUpdate');
      socket.off('notification');
      
      // Leave all session rooms
      sessions.forEach(session => {
        leaveSessionRoom(session.id);
      });
    };
  }, [sessions]);
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN':
        return 'Offen';
      case 'IN_PROGRESS':
        return 'In Bearbeitung';
      case 'COMPLETED':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: ''
    });
  };

  // Handle new session button click
  const handleNewSession = () => {
    navigate('/medic/new-session');
  };

  // Handle session click
  const handleSessionClick = (sessionId) => {
    navigate(`/medic/sessions/${sessionId}`);
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

  // Filter sessions based on current filters
  const filteredSessions = sessions.filter(session => {
    // Filter by status
    if (filters.status && session.status !== filters.status) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority && session.priority !== filters.priority) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        session.title.toLowerCase().includes(searchTerm) ||
        session.patientCode.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meine Sessions
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Hier finden Sie alle von Ihnen erstellten Sessions.
      </Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filter</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Suche"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="OPEN">Offen</MenuItem>
                  <MenuItem value="ASSIGNED">Zugewiesen</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Bearbeitung</MenuItem>
                  <MenuItem value="COMPLETED">Abgeschlossen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="priority-filter-label">Priorität</InputLabel>
                <Select
                  labelId="priority-filter-label"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  label="Priorität"
                >
                  <MenuItem value="">Alle Prioritäten</MenuItem>
                  <MenuItem value="LOW">Niedrig</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">Hoch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                fullWidth
              >
                Filter zurücksetzen
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleNewSession}
        >
          Neue Session
        </Button>
      </Box>
      
      {/* Sessions list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : filteredSessions.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          {sessions.length === 0 
            ? 'Sie haben noch keine Sessions erstellt.' 
            : 'Keine Sessions entsprechen den ausgewählten Filtern.'}
        </Alert>
      ) : (
        <Box>
          {filteredSessions.map((session) => (
            <Card key={session.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => handleSessionClick(session.id)}>
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
        </Box>
      )}
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicSessions; 