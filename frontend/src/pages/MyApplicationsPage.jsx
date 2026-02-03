import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, TableContainer,
} from '@mui/material';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const statusColor = (s) => {
  if (s === 'APPROVED') return 'success';
  if (s === 'REJECTED') return 'error';
  return 'warning';
};

export default function MyApplicationsPage() {
  const [apps, setApps] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/api/me/applications').then(setApps).catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>{t('myApplications.title')}</Typography>

      {apps.length === 0 ? (
        <Typography color="text.secondary">{t('myApplications.noApplications')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('myApplications.project')}</TableCell>
                <TableCell>{t('applicationStatus.status')}</TableCell>
                <TableCell>{t('myApplications.message')}</TableCell>
                <TableCell>{t('myApplications.applied')}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {apps.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.projectTitle}</TableCell>
                  <TableCell><Chip label={t(`applicationStatus.${a.status}`)} color={statusColor(a.status)} size="small" /></TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.message}
                  </TableCell>
                  <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/projects/${a.projectId}`)}>{t('common.view')}</Button>
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
