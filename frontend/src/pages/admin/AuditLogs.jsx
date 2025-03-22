import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { 
  Search as SearchIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    eventType: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const queryParams = {
        page: page + 1, // API typically uses 1-indexed pages
        limit: rowsPerPage,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => 
        !queryParams[key] && delete queryParams[key]
      );
      
      const response = await adminAPI.getAuditLogs(queryParams);
      setLogs(response.data.logs || []);
      setTotalItems(response.data.totalCount || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Fehler beim Laden der Audit-Logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page on filter change
  };

  // Get color for action type
  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      case 'LOGIN':
        return 'primary';
      case 'LOGOUT':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get color for event type
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'USER':
        return 'primary';
      case 'SESSION':
        return 'secondary';
      case 'SYSTEM':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Systemprotokolle
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="search"
              label="Suche"
              variant="outlined"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="event-type-label">Ereignistyp</InputLabel>
              <Select
                labelId="event-type-label"
                name="eventType"
                value={filters.eventType}
                label="Ereignistyp"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="USER">Benutzer</MenuItem>
                <MenuItem value="SESSION">Session</MenuItem>
                <MenuItem value="SYSTEM">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="action-label">Aktion</InputLabel>
              <Select
                labelId="action-label"
                name="action"
                value={filters.action}
                label="Aktion"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="CREATE">Erstellen</MenuItem>
                <MenuItem value="UPDATE">Aktualisieren</MenuItem>
                <MenuItem value="DELETE">Löschen</MenuItem>
                <MenuItem value="LOGIN">Anmelden</MenuItem>
                <MenuItem value="LOGOUT">Abmelden</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              name="dateFrom"
              label="Von Datum"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              name="dateTo"
              label="Bis Datum"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Benutzer</TableCell>
                    <TableCell>Ereignistyp</TableCell>
                    <TableCell>Aktion</TableCell>
                    <TableCell>Beschreibung</TableCell>
                    <TableCell>IP-Adresse</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>{log.username || 'System'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.eventType} 
                            color={getEventTypeColor(log.eventType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action} 
                            color={getActionColor(log.action)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 3 }}>
                          <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="h6">Keine Protokolleinträge gefunden</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Passen Sie die Filter an, um andere Ergebnisse zu sehen
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Zeilen pro Seite:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}–${to} von ${count !== -1 ? count : `mehr als ${to}`}`
              }
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AuditLogs; 