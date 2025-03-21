import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../../services/api';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sorting state
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  
  // Filtering state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all'
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();

  // Load sessions
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions from API
      const response = await sessionsAPI.getAll();
      
      if (response && response.data) {
        // Extrahieren des sessions-Array aus der API-Antwort
        const sessionsArray = response.data.sessions || [];
        setSessions(sessionsArray);
      } else {
        throw new Error('Invalid response format');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Fehler beim Laden der Sessions. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset to first page when filter changes
  };
  
  const handleViewSession = (id) => {
    navigate(`/doctor/sessions/${id}`);
  };
  
  const handleAcceptSession = async (id) => {
    try {
      // Show loading notification
      setNotification({
        open: true,
        message: 'Session wird akzeptiert...',
        severity: 'info'
      });
      
      // Get the current user ID from auth state
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const doctorId = currentUser?.id;
      
      if (!doctorId) {
        throw new Error('Arzt-ID nicht gefunden');
      }
      
      console.log('Assigning session to doctor ID:', doctorId);
      
      // Assign session to the current doctor using the assign API endpoint
      await sessionsAPI.assign(id, doctorId);
      
      // Reload sessions after successful update
      await loadSessions();
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Session erfolgreich übernommen',
        severity: 'success'
      });
      
      // Navigate to session detail page
      navigate(`/doctor/sessions/${id}`);
    } catch (err) {
      console.error('Error accepting session:', err);
      
      // Show error notification
      setNotification({
        open: true,
        message: 'Fehler beim Übernehmen der Session. Bitte versuchen Sie es später erneut.',
        severity: 'error'
      });
    }
  };
  
  const handleRefresh = () => {
    loadSessions();
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  const filterSessions = () => {
    return sessions.filter(session => {
      // Search filter (case insensitive)
      const matchesSearch = filters.search === '' || 
        (session.patientName && session.patientName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (session.medic && session.medic.name && session.medic.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (session.id && session.id.toLowerCase().includes(filters.search.toLowerCase()));
      
      // Status filter
      const matchesStatus = filters.status === 'all' || session.status === filters.status;
      
      // Priority filter
      const matchesPriority = filters.priority === 'all' || session.priority === filters.priority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };
  
  const sortSessions = (data) => {
    if (!orderBy) return data;
    
    return data.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      // Handle nested properties
      if (orderBy === 'medic.name') {
        aValue = a.medic ? a.medic.name : '';
        bValue = b.medic ? b.medic.name : '';
      }
      
      // Handle date strings
      if (orderBy === 'createdAt') {
        return order === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      // Handle strings (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle other types
      return order === 'asc'
        ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
        : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
    });
  };
  
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
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Wartend', icon: <AccessTimeIcon fontSize="small" />, color: 'warning' };
      case 'ACTIVE':
        return { label: 'Aktiv', icon: <CheckCircleIcon fontSize="small" />, color: 'success' };
      case 'COMPLETED':
        return { label: 'Abgeschlossen', icon: <CheckCircleIcon fontSize="small" />, color: 'info' };
      case 'CANCELLED':
        return { label: 'Abgebrochen', icon: <ErrorIcon fontSize="small" />, color: 'error' };
      default:
        return { label: status, icon: null, color: 'default' };
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ', ' + date.toLocaleDateString('de-DE');
  };
  
  const filteredSessions = filterSessions();
  const sortedSessions = sortSessions(filteredSessions);
  const paginatedSessions = sortedSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Sessions
        </Typography>
        <Button
          variant="outlined"
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Suche (Patient, Medic, ID)"
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Alle Status</MenuItem>
                <MenuItem value="PENDING">Wartend</MenuItem>
                <MenuItem value="ACTIVE">Aktiv</MenuItem>
                <MenuItem value="COMPLETED">Abgeschlossen</MenuItem>
                <MenuItem value="CANCELLED">Abgebrochen</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Priorität</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priorität"
              >
                <MenuItem value="all">Alle Prioritäten</MenuItem>
                <MenuItem value="HIGH">Hoch</MenuItem>
                <MenuItem value="MEDIUM">Mittel</MenuItem>
                <MenuItem value="LOW">Niedrig</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && paginatedSessions.length === 0 ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'id'}
                      direction={orderBy === 'id' ? order : 'asc'}
                      onClick={() => handleRequestSort('id')}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'patientName'}
                      direction={orderBy === 'patientName' ? order : 'asc'}
                      onClick={() => handleRequestSort('patientName')}
                    >
                      Patient
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'createdAt'}
                      direction={orderBy === 'createdAt' ? order : 'asc'}
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      Erstellungsdatum
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'priority'}
                      direction={orderBy === 'priority' ? order : 'asc'}
                      onClick={() => handleRequestSort('priority')}
                    >
                      Priorität
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'medic.name'}
                      direction={orderBy === 'medic.name' ? order : 'asc'}
                      onClick={() => handleRequestSort('medic.name')}
                    >
                      Medic
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" p={3}>
                        Keine Sessions gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSessions.map((session) => {
                    const statusInfo = getStatusInfo(session.status);
                    
                    return (
                      <TableRow 
                        key={session.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: session.status === 'OPEN' ? 'rgba(255, 152, 0, 0.05)' : 'inherit',
                          '&:hover': {
                            backgroundColor: session.status === 'OPEN' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                        onClick={() => handleViewSession(session.id)}
                      >
                        <TableCell>{session.id}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {session.patientName || 'Unbenannt'}
                            </Typography>
                            {session.age && (
                              <Typography variant="caption" color="text.secondary">
                                {session.age} Jahre
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(session.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getPriorityLabel(session.priority)}
                            color={getPriorityColor(session.priority)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={statusInfo.icon}
                            label={statusInfo.label}
                            color={statusInfo.color}
                          />
                        </TableCell>
                        <TableCell>
                          {session.medic?.name || 'Nicht zugewiesen'}
                        </TableCell>
                        <TableCell padding="none">
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Session anzeigen">
                              <IconButton 
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSession(session.id);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {session.status === 'OPEN' && (
                              <Tooltip title="Session annehmen">
                                <IconButton 
                                  size="small"
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptSession(session.id);
                                  }}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredSessions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </Paper>
      )}

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
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

export default Sessions; 