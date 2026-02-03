import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  MenuItem, Select, TableContainer, IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const ROLES = ['STUDENT', 'MENTOR', 'TEACHER', 'ADMIN'];

export default function AdminUsersPage() {
  const showSnackbar = useSnackbar();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);

  const load = () => {
    api.get('/api/admin/users').then(setUsers).catch(e => showSnackbar(e.message, 'error'));
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      showSnackbar(t('adminUsers.roleUpdated'));
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(t('adminUsers.confirmDelete'))) return;
    try {
      await api.del(`/api/admin/users/${userId}`);
      showSnackbar(t('adminUsers.userDeleted'));
      load();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>{t('adminUsers.title')}</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.id')}</TableCell>
              <TableCell>{t('common.email')}</TableCell>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('roles.role')}</TableCell>
              <TableCell>{t('common.created')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>
                  <Select size="small" value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}>
                    {ROLES.map(r => <MenuItem key={r} value={r}>{t(`roles.${r}`)}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
