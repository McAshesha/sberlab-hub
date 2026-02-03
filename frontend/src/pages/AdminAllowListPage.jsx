import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const ROLES = ['MENTOR', 'TEACHER', 'ADMIN'];

export default function AdminAllowListPage() {
  const showSnackbar = useSnackbar();
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('MENTOR');

  const load = () => {
    api.get('/api/admin/allow-list').then(setEntries).catch(e => showSnackbar(e.message, 'error'));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/api/admin/allow-list', { email: newEmail, role: newRole });
      showSnackbar(t('adminAllowList.entryAdded'));
      setDialogOpen(false);
      setNewEmail('');
      setNewRole('MENTOR');
      load();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  const handleRoleChange = async (entry, role) => {
    try {
      await api.put(`/api/admin/allow-list/${entry.id}`, { email: entry.email, role });
      showSnackbar(t('adminAllowList.roleUpdated'));
      load();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('adminAllowList.confirmRemove'))) return;
    try {
      await api.del(`/api/admin/allow-list/${id}`);
      showSnackbar(t('adminAllowList.entryRemoved'));
      load();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>{t('adminAllowList.title')}</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>{t('adminAllowList.addEntry')}</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.id')}</TableCell>
              <TableCell>{t('common.email')}</TableCell>
              <TableCell>{t('roles.role')}</TableCell>
              <TableCell>{t('common.created')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>
                  <Select size="small" value={e.role}
                    onChange={ev => handleRoleChange(e, ev.target.value)}>
                    {ROLES.map(r => <MenuItem key={r} value={r}>{t(`roles.${r}`)}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">{t('adminAllowList.noEntries')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('adminAllowList.addTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label={t('common.email')} fullWidth value={newEmail}
            onChange={e => setNewEmail(e.target.value)} />
          <TextField label={t('roles.role')} select fullWidth value={newRole}
            onChange={e => setNewRole(e.target.value)}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{t(`roles.${r}`)}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAdd} disabled={!newEmail.trim()}>{t('common.add')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
