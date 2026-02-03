import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, TextField, Button, MenuItem, FormControlLabel, Checkbox,
  Stack, Paper,
} from '@mui/material';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

export default function CreateProjectPage() {
  const { id } = useParams(); // edit mode if id exists
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    title: '', goal: '', keyTasks: '', valueText: '', requiredSkills: '',
    difficulty: 'MEDIUM', tags: '', curriculumMatch: '',
    thesisOk: false, practiceOk: false, courseworkOk: false,
    responsibilityBoundaries: '', contactPolicy: '',
  });

  useEffect(() => {
    if (id) {
      api.get(`/api/projects/${id}`).then(p => {
        setForm({
          title: p.title || '', goal: p.goal || '', keyTasks: p.keyTasks || '',
          valueText: p.valueText || '', requiredSkills: p.requiredSkills || '',
          difficulty: p.difficulty || 'MEDIUM', tags: p.tags || '',
          curriculumMatch: p.curriculumMatch || '',
          thesisOk: p.thesisOk, practiceOk: p.practiceOk, courseworkOk: p.courseworkOk,
          responsibilityBoundaries: p.responsibilityBoundaries || '',
          contactPolicy: p.contactPolicy || '',
        });
      }).catch(e => showSnackbar(e.message, 'error'));
    }
  }, [id, showSnackbar]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: val });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { showSnackbar(t('createProject.titleRequired'), 'warning'); return; }
    try {
      if (id) {
        await api.put(`/api/projects/${id}`, form);
        showSnackbar(t('createProject.projectUpdated'));
      } else {
        await api.post('/api/projects', form);
        showSnackbar(t('createProject.projectCreated'));
      }
      navigate('/mentor');
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  return (
    <Box maxWidth={800} mx="auto">
      <Typography variant="h5" fontWeight={700} mb={3}>
        {id ? t('createProject.editTitle') : t('createProject.createTitle')}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField label={`${t('createProject.title')} *`} fullWidth value={form.title} onChange={set('title')} />
          <TextField label={t('createProject.goal')} fullWidth multiline rows={3} value={form.goal} onChange={set('goal')} />
          <TextField label={t('createProject.keyTasks')} fullWidth multiline rows={3} value={form.keyTasks} onChange={set('keyTasks')} />
          <TextField label={t('createProject.value')} fullWidth multiline rows={2}
            value={form.valueText} onChange={set('valueText')} />
          <TextField label={t('createProject.requiredSkills')} fullWidth
            value={form.requiredSkills} onChange={set('requiredSkills')}
            placeholder={t('createProject.requiredSkillsPlaceholder')} />
          <TextField select label={t('difficulty.difficulty')} value={form.difficulty} onChange={set('difficulty')}>
            {DIFFICULTIES.map(d => <MenuItem key={d} value={d}>{t(`difficulty.${d}`)}</MenuItem>)}
          </TextField>
          <TextField label={t('createProject.tags')} fullWidth value={form.tags} onChange={set('tags')}
            placeholder={t('createProject.tagsPlaceholder')} />
          <TextField label={t('createProject.curriculumMatch')} fullWidth value={form.curriculumMatch}
            onChange={set('curriculumMatch')} />

          <Stack direction="row" spacing={2}>
            <FormControlLabel control={<Checkbox checked={form.thesisOk} onChange={set('thesisOk')} />}
              label={t('projectTypes.suitableForThesis')} />
            <FormControlLabel control={<Checkbox checked={form.practiceOk} onChange={set('practiceOk')} />}
              label={t('projectTypes.suitableForPractice')} />
            <FormControlLabel control={<Checkbox checked={form.courseworkOk} onChange={set('courseworkOk')} />}
              label={t('projectTypes.suitableForCoursework')} />
          </Stack>

          <TextField label={t('createProject.responsibilityBoundaries')} fullWidth multiline rows={2}
            value={form.responsibilityBoundaries} onChange={set('responsibilityBoundaries')} />
          <TextField label={t('createProject.contactPolicy')} fullWidth value={form.contactPolicy}
            onChange={set('contactPolicy')} placeholder={t('createProject.contactPolicyPlaceholder')} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => navigate('/mentor')}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {id ? t('common.save') : t('createProject.createTitle')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
