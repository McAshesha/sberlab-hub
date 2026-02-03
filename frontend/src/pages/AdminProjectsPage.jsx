import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, TableContainer,
} from '@mui/material';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const statusColor = (s) => {
  if (s === 'PUBLISHED') return 'success';
  if (s === 'ARCHIVED') return 'default';
  return 'warning';
};

export default function AdminProjectsPage() {
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);

  const load = () => {
    api.get('/api/admin/projects').then(setProjects).catch(e => showSnackbar(e.message, 'error'));
  };

  useEffect(() => { load(); }, []);

  const handleArchive = async (id) => {
    try {
      await api.post(`/api/admin/projects/${id}/archive`);
      showSnackbar(t('adminProjects.projectArchived'));
      load();
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('adminProjects.confirmDelete'))) return;
    try {
      await api.del(`/api/admin/projects/${id}`);
      showSnackbar(t('adminProjects.projectDeleted'));
      load();
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  const handleRegenerateEmbeddings = async () => {
    try {
      await api.post('/api/admin/projects/regenerate-embeddings');
      showSnackbar(t('adminProjects.embeddingsRegenerationStarted'));
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>{t('adminProjects.title')}</Typography>
        <Button variant="contained" color="primary" onClick={handleRegenerateEmbeddings}>
          {t('adminProjects.regenerateEmbeddings')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.id')}</TableCell>
              <TableCell>{t('createProject.title')}</TableCell>
              <TableCell>{t('adminProjects.mentor')}</TableCell>
              <TableCell>{t('projectStatus.status')}</TableCell>
              <TableCell>{t('common.created')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.mentorName}</TableCell>
                <TableCell><Chip label={t(`projectStatus.${p.status}`)} color={statusColor(p.status)} size="small" /></TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/projects/${p.id}`)}>{t('common.view')}</Button>
                  {p.status !== 'ARCHIVED' && (
                    <Button size="small" color="warning" onClick={() => handleArchive(p.id)}>{t('mentorDashboard.archive')}</Button>
                  )}
                  <Button size="small" color="error" onClick={() => handleDelete(p.id)}>{t('common.delete')}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
