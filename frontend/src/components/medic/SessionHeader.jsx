import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Stack
} from '@mui/material';

const SessionHeader = ({ session }) => {
  // Helper function to render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'OPEN':
        return <Chip label="Offen" color="warning" />;
      case 'ASSIGNED':
        return <Chip label="Zugewiesen" color="info" />;
      case 'IN_PROGRESS':
        return <Chip label="In Bearbeitung" color="primary" />;
      case 'COMPLETED':
        return <Chip label="Abgeschlossen" color="success" />;
      default:
        return <Chip label={status} />;
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

  if (!session) return null;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {session.title}
        </Typography>
        <Stack direction="row" spacing={1}>
          {renderStatusChip(session.status)}
          {renderPriorityChip(session.priority)}
        </Stack>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Session-ID:</strong> {session.patientCode}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>Erstellt am:</strong> {new Date(session.createdAt).toLocaleString('de-DE')}
          </Typography>
        </Grid>
        
        {session.assignedTo && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Zugewiesen an:</strong> {session.assignedTo.firstName} {session.assignedTo.lastName}
            </Typography>
          </Grid>
        )}
        
        {session.completedAt && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Abgeschlossen am:</strong> {new Date(session.completedAt).toLocaleString('de-DE')}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default SessionHeader; 