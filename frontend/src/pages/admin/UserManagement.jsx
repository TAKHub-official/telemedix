import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { usersAPI, adminAPI } from '../../services/api';

const UserManagement = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'MEDIC'
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // New role and password state
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Fehler beim Laden der Benutzerdaten');
    } finally {
      setLoading(false);
    }
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open create user dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'MEDIC'
    });
    setOpenCreateDialog(true);
  };

  // Open edit user dialog
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      // Don't set password for editing
      password: ''
    });
    setOpenEditDialog(true);
  };

  // Open delete user dialog
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Open role change dialog
  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setOpenRoleDialog(true);
  };

  // Open reset password dialog
  const handleOpenResetPasswordDialog = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setOpenResetPasswordDialog(true);
  };

  // Close all dialogs
  const handleCloseDialogs = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenRoleDialog(false);
    setOpenResetPasswordDialog(false);
    setSelectedUser(null);
  };

  // Handle create user
  const handleCreateUser = async () => {
    try {
      if (!formData.password || formData.password.trim() === '') {
        showNotification('Bitte geben Sie ein Passwort ein', 'error');
        return;
      }

      console.log('Creating user with data:', { 
        ...formData, 
        password: formData.password ? '********' : 'no password set'
      });
      
      await usersAPI.create(formData);
      await fetchUsers();
      handleCloseDialogs();
      showNotification('Benutzer erfolgreich erstellt', 'success');
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Erstellen des Benutzers';
      showNotification(errorMessage, 'error');
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Create a data object without password if it's empty
      const updateData = {...formData};
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await usersAPI.update(selectedUser.id, updateData);
      await fetchUsers();
      handleCloseDialogs();
      showNotification('Benutzer erfolgreich aktualisiert', 'success');
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Aktualisieren des Benutzers';
      showNotification(errorMessage, 'error');
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await usersAPI.delete(selectedUser.id);
      await fetchUsers();
      handleCloseDialogs();
      showNotification('Benutzer erfolgreich gelöscht', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Löschen des Benutzers';
      showNotification(errorMessage, 'error');
    }
  };

  // Handle role change
  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await usersAPI.changeRole(selectedUser.id, newRole);
      await fetchUsers();
      handleCloseDialogs();
      showNotification('Benutzerrolle erfolgreich geändert', 'success');
    } catch (err) {
      console.error('Error changing role:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Ändern der Benutzerrolle';
      showNotification(errorMessage, 'error');
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      await adminAPI.resetUserPassword(selectedUser.id, newPassword);
      handleCloseDialogs();
      showNotification('Passwort erfolgreich zurückgesetzt', 'success');
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err.response?.data?.message || 'Fehler beim Zurücksetzen des Passworts';
      showNotification(errorMessage, 'error');
    }
  };

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Get role color for chips
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'DOCTOR':
        return 'primary';
      case 'MEDIC':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render German role name
  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'DOCTOR':
        return 'Arzt';
      case 'MEDIC':
        return 'Medic';
      default:
        return role;
    }
  };

  // Render German status name
  const getStatusName = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktiv';
      case 'INACTIVE':
        return 'Inaktiv';
      case 'SUSPENDED':
        return 'Gesperrt';
      default:
        return status;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Benutzerverwaltung
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Neuer Benutzer
        </Button>
      </Box>

      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2, color: 'white', borderColor: 'white' }}
            onClick={fetchUsers}
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
                  <TableCell>Name</TableCell>
                  <TableCell>E-Mail</TableCell>
                  <TableCell>Rolle</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleName(user.role)} 
                          color={getRoleColor(user.role)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusName(user.status)} 
                          color={getStatusColor(user.status)} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(user)}
                          aria-label="Benutzer bearbeiten"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleOpenRoleDialog(user)}
                          aria-label="Rolle ändern"
                        >
                          <PersonIcon />
                        </IconButton>
                        <IconButton 
                          color="warning" 
                          onClick={() => handleOpenResetPasswordDialog(user)}
                          aria-label="Passwort zurücksetzen"
                        >
                          <LockResetIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(user)}
                          aria-label="Benutzer löschen"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </Paper>
      )}

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="Vorname"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Nachname"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Passwort"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Rolle</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rolle"
                >
                  <MenuItem value="ADMIN">Administrator</MenuItem>
                  <MenuItem value="DOCTOR">Arzt</MenuItem>
                  <MenuItem value="MEDIC">Medic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained" 
            color="primary"
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="Vorname"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Nachname"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={selectedUser?.role === 'ADMIN'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Passwort (leer lassen für unverändert)"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Rolle</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rolle"
                  disabled={selectedUser?.role === 'ADMIN'}
                >
                  <MenuItem value="ADMIN">Administrator</MenuItem>
                  <MenuItem value="DOCTOR">Arzt</MenuItem>
                  <MenuItem value="MEDIC">Medic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button 
            onClick={handleUpdateUser} 
            variant="contained" 
            color="primary"
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Benutzer löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie den Benutzer "{selectedUser?.firstName} {selectedUser?.lastName}" löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Benutzerrolle ändern</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ändern Sie die Rolle für {selectedUser?.firstName} {selectedUser?.lastName}.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Rolle</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={newRole}
              label="Rolle"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="ADMIN">Administrator</MenuItem>
              <MenuItem value="DOCTOR">Arzt</MenuItem>
              <MenuItem value="MEDIC">Sanitäter</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button 
            onClick={handleChangeRole} 
            variant="contained" 
            color="primary"
          >
            Rolle ändern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={openResetPasswordDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Passwort zurücksetzen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Setzen Sie ein neues Passwort für {selectedUser?.firstName} {selectedUser?.lastName}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="newPassword"
            label="Neues Passwort"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            color="primary"
            disabled={!newPassword}
          >
            Passwort zurücksetzen
          </Button>
        </DialogActions>
      </Dialog>

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

export default UserManagement; 