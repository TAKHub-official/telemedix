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
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api as apiService } from '../../services/api';

// Mock data for archived sessions
const mockArchivedSessions = [
  {
    id: 'sess-005',
    patientName: 'Maria Schneider',
    age: 65,
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: '2025-03-18T15:30:00Z',
    completedAt: '2025-03-18T16:45:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-006',
    patientName: 'Michael Braun',
    age: 42,
    priority: 'LOW',
    status: 'COMPLETED',
    createdAt: '2025-03-17T10:15:00Z',
    completedAt: '2025-03-17T11:20:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-007',
    patientName: 'Sophie Fischer',
    age: 29,
    priority: 'HIGH',
    status: 'COMPLETED',
    createdAt: '2025-03-16T14:00:00Z',
    completedAt: '2025-03-16T14:55:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  },
  {
    id: 'sess-008',
    patientName: 'Thomas Becker',
    age: 58,
    priority: 'HIGH',
    status: 'CANCELLED',
    createdAt: '2025-03-15T09:30:00Z',
    completedAt: '2025-03-15T09:45:00Z',
    assignedTo: 'Dr. Thomas Müller',
    medic: {
      name: 'Lukas Wagner',
      id: 'medic-001'
    }
  }
];

const Archives = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  // Load archived sessions
  useEffect(() => {
    const loadArchivedSessions = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch data from the API
        // For now, we'll simulate an API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setSessions(mockArchivedSessions);
        setFilteredSessions(mockArchivedSessions);
        setError(null);
      } catch (err) {
        console.error('Error loading archived sessions:', err);
        setError('Fehler beim Laden der archivierten Sessions');
      } finally {
        setLoading(false);
      }
    };

    loadArchivedSessions();
  }, []);

  // Filter sessions by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSessions(sessions);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = sessions.filter(session => 
        session.patientName.toLowerCase().includes(term)
      );
      setFilteredSessions(filtered);
    }
    setPage(0); // Reset to first page when search changes
  }, [searchTerm, sessions]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view session
  const handleViewSession = (id) => {
    navigate(`/doctor/sessions/${id}`);
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
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

  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMinutes = Math.round((end - start) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} Minuten`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} Std. ${minutes} Min.`;
    }
  };

  // Get current slice of data for pagination
  const currentSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Archivierte Sessions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hier finden Sie alle abgeschlossenen und abgebrochenen Sessions.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Session suchen"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Archives Table */}
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
                  <TableCell>Patient</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Erstellt am</TableCell>
                  <TableCell>Beendet am</TableCell>
                  <TableCell>Dauer</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Keine archivierten Sessions gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSessions.map((session) => (
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
                          label={session.status === 'COMPLETED' ? 'Abgeschlossen' : 'Abgebrochen'}
                          color={getStatusColor(session.status)}
                          size="small"
                          icon={session.status === 'COMPLETED' ? <CheckCircleIcon /> : null}
                        />
                      </TableCell>
                      <TableCell>{formatDate(session.createdAt)}</TableCell>
                      <TableCell>{formatDate(session.completedAt)}</TableCell>
                      <TableCell>{calculateDuration(session.createdAt, session.completedAt)}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewSession(session.id)}
                          title="Details anzeigen"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
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
    </Box>
  );
};

export default Archives; 