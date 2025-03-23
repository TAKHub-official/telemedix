import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  Divider
} from '@mui/material';

const TreatmentPlan = ({ treatmentPlan }) => {
  if (!treatmentPlan) return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behandlungsplan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Noch kein Behandlungsplan erstellt.
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behandlungsplan
        </Typography>
        <Chip 
          label={
            treatmentPlan.status === 'DRAFT' ? 'Entwurf' :
            treatmentPlan.status === 'ACTIVE' ? 'Aktiv' :
            treatmentPlan.status === 'COMPLETED' ? 'Abgeschlossen' :
            treatmentPlan.status
          } 
          color={
            treatmentPlan.status === 'DRAFT' ? 'default' :
            treatmentPlan.status === 'ACTIVE' ? 'primary' :
            treatmentPlan.status === 'COMPLETED' ? 'success' :
            'default'
          }
          sx={{ mb: 2 }}
        />
        
        {treatmentPlan.diagnosis && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Diagnose:</strong> {treatmentPlan.diagnosis}
          </Typography>
        )}
        
        {treatmentPlan.steps && treatmentPlan.steps.length > 0 ? (
          <List>
            {treatmentPlan.steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <ListItem>
                  <ListItemText
                    primary={`${index + 1}. ${step.description}`}
                    secondary={
                      <Chip 
                        label={
                          step.status === 'PENDING' ? 'Ausstehend' :
                          step.status === 'IN_PROGRESS' ? 'In Bearbeitung' :
                          step.status === 'COMPLETED' ? 'Abgeschlossen' :
                          step.status
                        } 
                        size="small"
                        color={
                          step.status === 'PENDING' ? 'default' :
                          step.status === 'IN_PROGRESS' ? 'primary' :
                          step.status === 'COMPLETED' ? 'success' :
                          'default'
                        }
                        sx={{ mt: 1 }}
                      />
                    }
                  />
                </ListItem>
                {index < treatmentPlan.steps.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Keine Behandlungsschritte definiert.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TreatmentPlan; 