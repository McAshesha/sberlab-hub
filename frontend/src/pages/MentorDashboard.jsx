import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Button, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Stack, TableContainer,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const statusColor = (s) => {
  if (s === 'PUBLISHED') return 'success';
  if (s === 'ARCHIVED') return 'default';
  return 'warning';
};

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);

  const load = () => {
    api.get(`/api/projects?size=100&mentorId=${user.id}`).then(d => setProjects(d.items)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handlePublish = async (id) => {
    try {
      await api.post(`/api/projects/${id}/publish`);
      showSnackbar(t('mentorDashboard.projectPublished'));
      load();
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  const handleArchive = async (id) => {
    try {
      await api.post(`/api/projects/${id}/archive`);
      showSnackbar(t('mentorDashboard.projectArchived'));
      load();
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>{t('mentorDashboard.title')}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/mentor/new')}>
          {t('mentorDashboard.newProject')}
        </Button>
      </Stack>

      {projects.length === 0 ? (
        <Typography color="text.secondary">{t('mentorDashboard.noProjects')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('createProject.title')}</TableCell>
                <TableCell>{t('projectStatus.status')}</TableCell>
                <TableCell>{t('difficulty.difficulty')}</TableCell>
                <TableCell>{t('common.created')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.title}</TableCell>
                  <TableCell><Chip label={t(`projectStatus.${p.status}`)} color={statusColor(p.status)} size="small" /></TableCell>
                  <TableCell>{t(`difficulty.${p.difficulty}`)}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" onClick={() => navigate(`/projects/${p.id}`)}>{t('common.view')}</Button>
                      <Button size="small" onClick={() => navigate(`/mentor/edit/${p.id}`)}>{t('common.edit')}</Button>
                      {p.status === 'DRAFT' && (
                        <Button size="small" color="success" onClick={() => handlePublish(p.id)}>{t('mentorDashboard.publish')}</Button>
                      )}
                      {p.status !== 'ARCHIVED' && (
                        <Button size="small" color="error" onClick={() => handleArchive(p.id)}>{t('mentorDashboard.archive')}</Button>
                      )}
                      <Button size="small" onClick={() => navigate(`/mentor/projects/${p.id}/applications`)}>
                        {t('mentorDashboard.applications')}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
