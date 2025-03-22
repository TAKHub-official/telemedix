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
      const assignResult = await sessionsAPI.assign(id, doctorId);
      console.log('Session assign result:', assignResult);
      
      if (assignResult) {
        // Immediately set status to IN_PROGRESS (skip ASSIGNED state)
        console.log('Updating session status to IN_PROGRESS...');
        const updateResult = await sessionsAPI.update(id, { status: 'IN_PROGRESS' });
        console.log('Session update result:', updateResult);
      }
      
      // Reload sessions after successful update
      await loadSessions();
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Session erfolgreich übernommen und gestartet',
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
      // Apply search filter
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          (session.patientCode || '').toLowerCase().includes(searchTerm) ||
          (session.title || '').toLowerCase().includes(searchTerm) ||
          (session.createdBy ? 
            `${session.createdBy.firstName || ''} ${session.createdBy.lastName || ''}`.toLowerCase().includes(searchTerm) 
            : false);
        
        if (!matchesSearch) return false;
      }
      
      // Apply status filter
      if (filters.status !== 'all' && session.status !== filters.status) {
        return false;
      }
      
      // Apply priority filter
      if (filters.priority !== 'all' && session.priority !== filters.priority) {
        return false;
      }
      
      return true;
    });
  };
  
  const sortSessions = (data) => {
    if (!orderBy) {
      return data;
    }
    
    return [...data].sort((a, b) => {
      // Handling for nested properties (e.g., 'medic.name')
      if (orderBy.includes('.')) {
        const [parent, child] = orderBy.split('.');
        const aValue = a[parent] ? a[parent][child] : '';
        const bValue = b[parent] ? b[parent][child] : '';
        
        if (!aValue && bValue) return order === 'asc' ? -1 : 1;
        if (aValue && !bValue) return order === 'asc' ? 1 : -1;
        if (!aValue && !bValue) return 0;
        
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // For regular properties
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle dates
      if (orderBy === 'createdAt' || orderBy === 'updatedAt' || orderBy === 'completedAt') {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        
        if (order === 'asc') {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      }
      
      // For other types or if the property doesn't exist on the object
      if (order === 'asc') {
        return (aValue > bValue) ? 1 : -1;
      } else {
        return (aValue > bValue) ? -1 : 1;
      }
    });
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'NORMAL':
        return 'info';
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
      case 'NORMAL':
        return 'Normal';
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
              label="Suche (Session-ID, Beschwerde)"
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
                <MenuItem value="NORMAL">Normal</MenuItem>
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
                      active={orderBy === 'patientCode'}
                      direction={orderBy === 'patientCode' ? order : 'asc'}
                      onClick={() => handleRequestSort('patientCode')}
                    >
                      Session-ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'title'}
                      direction={orderBy === 'title' ? order : 'asc'}
                      onClick={() => handleRequestSort('title')}
                    >
                      Hauptbeschwerde
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
                      active={orderBy === 'createdBy.firstName'}
                      direction={orderBy === 'createdBy.firstName' ? order : 'asc'}
                      onClick={() => handleRequestSort('createdBy.firstName')}
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
                        <TableCell>{session.patientCode || 'Nicht verfügbar'}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {session.title || 'Keine Beschreibung'}
                            </Typography>
                            {session.medicalRecord?.patientAge && (
                              <Typography variant="caption" color="text.secondary">
                                {session.medicalRecord.patientAge} Jahre
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
                          {session.createdBy ? 
                            `${session.createdBy.firstName || ''} ${session.createdBy.lastName || ''}`.trim() || 'Nicht zugewiesen' 
                            : 'Nicht zugewiesen'}
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