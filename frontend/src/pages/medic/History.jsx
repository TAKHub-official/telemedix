import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  Divider, 
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { sessionService } from '../../services/sessionService';

const MedicHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Favorited sessions
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('medic_favorite_history_sessions');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch completed sessions created by the medic
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sessionService.getSessions({ status: 'COMPLETED' });
        setSessions(response.sessions || []);
      } catch (err) {
        console.error('Error fetching completed sessions:', err);
        setError('Fehler beim Laden der abgeschlossenen Sessions. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle page change
  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Handle session click
  const handleSessionClick = (sessionId) => {
    navigate(`/medic/sessions/${sessionId}`);
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      session.title.toLowerCase().includes(term) ||
      session.patientCode.toLowerCase().includes(term)
    );
  });

  // Handle toggling favorite status
  const handleToggleFavorite = (id, e) => {
    e.stopPropagation(); // Prevent row click
    
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('medic_favorite_history_sessions', JSON.stringify(newFavorites));
    
    // Show notification
    setNotification({
      open: true,
      message: favorites.includes(id) 
        ? 'Session aus Favoriten entfernt' 
        : 'Session zu Favoriten hinzugefügt',
      severity: 'success'
    });
  };
  
  // Handle closing notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Sort and paginate sessions - favorites at the top
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const aFavorite = favorites.includes(a.id);
    const bFavorite = favorites.includes(b.id);
    
    if (aFavorite && !bFavorite) return -1;
    if (!aFavorite && bFavorite) return 1;
    
    // If both have same favorite status, sort by completion date (newer first)
    const aDate = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bDate = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bDate - aDate;
  });
  
  // Get current page of data
  const paginatedSessions = sortedSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        Abgeschlossene Sessions
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Hier finden Sie alle von Ihnen erstellten abgeschlossenen Sessions.
      </Typography>
      
      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Suche"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {/* Sessions table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : filteredSessions.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          {sessions.length === 0 
            ? 'Sie haben noch keine abgeschlossenen Sessions.' 
            : 'Keine abgeschlossenen Sessions entsprechen dem Suchbegriff.'}
        </Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Titel</TableCell>
                  <TableCell>Session-ID</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Erstellt am</TableCell>
                  <TableCell>Abgeschlossen am</TableCell>
                  <TableCell>Arzt</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSessions.map((session) => (
                  <TableRow 
                    key={session.id}
                    hover
                    onClick={() => handleSessionClick(session.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      {session.title}
                    </TableCell>
                    <TableCell>{session.patientCode}</TableCell>
                    <TableCell>{renderPriorityChip(session.priority)}</TableCell>
                    <TableCell>{new Date(session.createdAt).toLocaleString('de-DE')}</TableCell>
                    <TableCell>
                      {session.completedAt 
                        ? new Date(session.completedAt).toLocaleString('de-DE') 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {session.assignedTo 
                        ? `${session.assignedTo.firstName} ${session.assignedTo.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={favorites.includes(session.id) ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => handleToggleFavorite(session.id, e)}
                        >
                          {favorites.includes(session.id) ? 
                            <StarIcon fontSize="small" color="warning" /> : 
                            <StarBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
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
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} von ${count}`}
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

export default MedicHistory; 