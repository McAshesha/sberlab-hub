import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, Stack, TableContainer, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const statusColor = (s) => {
  if (s === 'APPROVED') return 'success';
  if (s === 'REJECTED') return 'error';
  return 'warning';
};

export default function MentorProjectApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const { t } = useLanguage();
  const [apps, setApps] = useState([]);
  const [project, setProject] = useState(null);
  const [fbOpen, setFbOpen] = useState(false);
  const [fbStudent, setFbStudent] = useState(null);
  const [fbType, setFbType] = useState('INTERIM');
  const [fbRating, setFbRating] = useState(3);
  const [fbComment, setFbComment] = useState('');

  const load = async () => {
    try {
      const p = await api.get(`/api/projects/${id}`);
      setProject(p);
    } catch (e) { showSnackbar(e.message, 'error'); return; }

    try {
      const a = await api.get(`/api/projects/${id}/applications`);
      setApps(a);
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  useEffect(() => { load(); }, [id]);

  const handleApprove = async (appId) => {
    try { await api.post(`/api/applications/${appId}/approve`); showSnackbar(t('mentorApplications.approved')); load(); }
    catch (e) { showSnackbar(e.message, 'error'); }
  };

  const handleReject = async (appId) => {
    try { await api.post(`/api/applications/${appId}/reject`); showSnackbar(t('mentorApplications.rejected')); load(); }
    catch (e) { showSnackbar(e.message, 'error'); }
  };

  const openFeedback = (app) => {
    setFbStudent(app);
    setFbOpen(true);
    setFbType('INTERIM');
    setFbRating(3);
    setFbComment('');
  };

  const handleFeedback = async () => {
    try {
      await api.post(`/api/projects/${id}/feedback`, {
        studentId: fbStudent.studentId, type: fbType, rating: fbRating, comment: fbComment,
      });
      showSnackbar(t('mentorApplications.feedbackSubmitted'));
      setFbOpen(false);
    } catch (e) { showSnackbar(e.message, 'error'); }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/mentor')} sx={{ mb: 2 }}>{t('common.back')}</Button>
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t('mentorApplications.title')}: {project?.title || '...'}
      </Typography>

      {apps.length === 0 ? (
        <Typography color="text.secondary">{t('mentorApplications.noApplications')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('mentorApplications.student')}</TableCell>
                <TableCell>{t('common.email')}</TableCell>
                <TableCell>{t('myApplications.message')}</TableCell>
                <TableCell>{t('applicationStatus.status')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apps.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.studentName}</TableCell>
                  <TableCell>{a.studentEmail}</TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.message}
                  </TableCell>
                  <TableCell><Chip label={t(`applicationStatus.${a.status}`)} color={statusColor(a.status)} size="small" /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {a.status === 'PENDING' && (
                        <>
                          <Button size="small" color="success" onClick={() => handleApprove(a.id)}>{t('mentorApplications.approve')}</Button>
                          <Button size="small" color="error" onClick={() => handleReject(a.id)}>{t('mentorApplications.reject')}</Button>
                        </>
                      )}
                      {a.status === 'APPROVED' && (
                        <Button size="small" onClick={() => openFeedback(a)}>{t('mentorApplications.giveFeedback')}</Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Feedback dialog */}
      <Dialog open={fbOpen} onClose={() => setFbOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('mentorApplications.feedbackTitle')} {fbStudent?.studentName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField select label={t('mentorApplications.feedbackType')} value={fbType} onChange={e => setFbType(e.target.value)}>
              <MenuItem value="INTERIM">{t('mentorApplications.feedbackTypeInterim')}</MenuItem>
              <MenuItem value="FINAL">{t('mentorApplications.feedbackTypeFinal')}</MenuItem>
            </TextField>
            <TextField select label={t('mentorApplications.feedbackRating')} value={fbRating} onChange={e => setFbRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(v => <MenuItem key={v} value={v}>{v} / 5</MenuItem>)}
            </TextField>
            <TextField label={t('mentorApplications.feedbackComment')} multiline rows={3} fullWidth
              value={fbComment} onChange={e => setFbComment(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFbOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleFeedback}>{t('common.submit')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
