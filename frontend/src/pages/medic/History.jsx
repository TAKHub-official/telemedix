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
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { sessionService } from '../../services/sessionService';

const MedicHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // Get current page of data
  const paginatedSessions = filteredSessions.slice(
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
        return <Chip label="Hoch" color="warning" size="small" variant="outlined" />;
      case 'URGENT':
        return <Chip label="Dringend" color="error" size="small" variant="outlined" />;
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
    </Box>
  );
};

export default MedicHistory; 