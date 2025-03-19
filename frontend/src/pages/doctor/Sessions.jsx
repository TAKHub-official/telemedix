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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api as apiService } from '../../services/api';

// Mock data for sessions
const mockSessions = [
  {
    id: 'sess-001',
    patientName: 'Max Mustermann',
    age: 45,
    priority: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2025-03-19T10:30:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-002',
    patientName: 'Anna Schmidt',
    age: 32,
    priority: 'MEDIUM',
    status: 'ACTIVE',
    createdAt: '2025-03-19T11:15:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-003',
    patientName: 'Julia Weber',
    age: 28,
    priority: 'LOW',
    status: 'PENDING',
    createdAt: '2025-03-19T11:45:00Z',
    assignedTo: null,
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-004',
    patientName: 'Peter Klein',
    age: 55,
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: '2025-03-19T12:10:00Z',
    assignedTo: null,
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-005',
    patientName: 'Maria Schneider',
    age: 65,
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: '2025-03-18T15:30:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  }
];

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
    const loadSessions = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch data from the API
        // For now, we'll simulate an API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setSessions(mockSessions);
        setError(null);
      } catch (err) {
        console.error('Error loading sessions:', err);
        setError('Fehler beim Laden der Sessions');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset to first page when filter changes
  };

  // Handle view session
  const handleViewSession = (id) => {
    navigate(`/doctor/sessions/${id}`);
  };

  // Handle accept session
  const handleAcceptSession = async (id) => {
    try {
      // In a real implementation, this would call the API to update the session
      console.log(`Accepting session: ${id}`);
      
      // For mock data, we'll update the local state
      setSessions(sessions.map(session => 
        session.id === id 
          ? { ...session, status: 'ACTIVE', assignedTo: 'Dr. Thomas Müller' } 
          : session
      ));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Session erfolgreich angenommen',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error accepting session:', err);
      setNotification({
        open: true,
        message: 'Fehler beim Annehmen der Session',
        severity: 'error'
      });
    }
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Filter sessions
  const filterSessions = () => {
    return sessions.filter(session => {
      // Search filter
      const searchMatch = filters.search === '' || 
        session.patientName.toLowerCase().includes(filters.search.toLowerCase());
      
      // Status filter
      const statusMatch = filters.status === 'all' || session.status === filters.status;
      
      // Priority filter
      const priorityMatch = filters.priority === 'all' || session.priority === filters.priority;
      
      return searchMatch && statusMatch && priorityMatch;
    });
  };

  // Sort sessions
  const sortSessions = (data) => {
    return data.sort((a, b) => {
      let comparison = 0;
      
      // Sort by selected column
      switch (orderBy) {
        case 'patientName':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'priority':
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { PENDING: 0, ACTIVE: 1, COMPLETED: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      
      // Apply sort direction
      return order === 'desc' ? -comparison : comparison;
    });
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

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'primary', icon: <CheckCircleIcon />, label: 'Aktiv' };
      case 'PENDING':
        return { color: 'warning', icon: <AccessTimeIcon />, label: 'Wartend' };
      case 'COMPLETED':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Abgeschlossen' };
      case 'CANCELLED':
        return { color: 'error', icon: <ErrorIcon />, label: 'Abgebrochen' };
      default:
        return { color: 'default', icon: null, label: status };
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

  // Get filtered and sorted data
  const filteredSessions = sortSessions(filterSessions());
  
  // Apply pagination
  const paginatedSessions = filteredSessions.slice(
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
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/doctor/sessions/new')}
        >
          Neue Session
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Suche"
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => setFilters({ search: '', status: 'all', priority: 'all' })}
            >
              Filter zurücksetzen
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sessions Table */}
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
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                      active={orderBy === 'createdAt'}
                      direction={orderBy === 'createdAt' ? order : 'asc'}
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      Erstellt am
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Medic</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Keine Sessions gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSessions.map((session) => {
                    const statusInfo = getStatusInfo(session.status);
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          {session.patientName}, {session.age}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.priority}
                            color={getPriorityColor(session.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusInfo.icon}
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(session.createdAt)}</TableCell>
                        <TableCell>{session.medic.name}</TableCell>
                        <TableCell>
                          <Box>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewSession(session.id)}
                              title="Details anzeigen"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            
                            {session.status === 'PENDING' && (
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleAcceptSession(session.id)}
                                sx={{ ml: 1 }}
                              >
                                Annehmen
                              </Button>
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