import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Chip, Stack, Card, CardContent, Button, TextField,
  Divider, Paper, MenuItem, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, useTheme, alpha, Avatar,
} from '@mui/material';
import { ArrowBack, Send, QuestionAnswer, Star, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useSnackbar } from '../SnackbarContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const theme = useTheme();
  const { t } = useLanguage();
  const [project, setProject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qVisibility, setQVisibility] = useState('PUBLIC');
  const [answerTexts, setAnswerTexts] = useState({});
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [feedback, setFeedback] = useState([]);

  const load = useCallback(async () => {
    try {
      const p = await api.get(`/api/projects/${id}`);
      setProject(p);
    } catch (e) {
      showSnackbar(e.message, 'error');
      return;
    }

    try {
      const qs = await api.get(`/api/projects/${id}/questions`);
      setQuestions(qs);
    } catch { /* questions may fail independently */ }

    if (user.role === 'ADMIN' || user.role === 'MENTOR' || user.role === 'STUDENT') {
      try {
        const fb = await api.get(`/api/projects/${id}/feedback`);
        setFeedback(fb);
      } catch { /* may not have access */ }
    }
  }, [id, user, showSnackbar]);

  useEffect(() => { load(); }, [load]);

  const handleApply = async () => {
    try {
      await api.post(`/api/projects/${id}/apply`, { message: applyMsg });
      showSnackbar(t('projectDetail.applicationSubmitted'));
      setApplyOpen(false);
      setApplyMsg('');
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  const handleAskQuestion = async () => {
    if (!qText.trim()) return;
    try {
      await api.post(`/api/projects/${id}/questions`, { text: qText, visibility: qVisibility });
      showSnackbar(t('projectDetail.questionPosted'));
      setQText('');
      load();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  const handleAnswer = async (questionId) => {
    const text = answerTexts[questionId];
    if (!text?.trim()) return;
    try {
      await api.post(`/api/questions/${questionId}/answer`, { text });
      showSnackbar(t('projectDetail.answerPosted'));
      setAnswerTexts({ ...answerTexts, [questionId]: '' });
      load();
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  const difficultyColor = (d) => {
    if (d === 'EASY') return 'success';
    if (d === 'HARD') return 'error';
    return 'warning';
  };

  if (!project) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const isMentorOrAdmin = user.role === 'ADMIN' || (user.role === 'MENTOR' && project.mentorId === user.id);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        {t('projectDetail.backToCatalog')}
      </Button>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
          <Chip
            label={t(`projectStatus.${project.status}`)}
            color={project.status === 'PUBLISHED' ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            label={t(`difficulty.${project.difficulty}`)}
            color={difficultyColor(project.difficulty)}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          {project.thesisOk && <Chip label={t('projectTypes.thesis')} size="small" variant="outlined" />}
          {project.practiceOk && <Chip label={t('projectTypes.practice')} size="small" variant="outlined" />}
          {project.courseworkOk && <Chip label={t('projectTypes.coursework')} size="small" variant="outlined" />}
        </Stack>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          {project.title}
        </Typography>

        {/* Mentor info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: 'secondary.main',
              fontWeight: 600,
            }}
          >
            {project.mentorName?.charAt(0)?.toUpperCase() || 'M'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {project.mentorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {project.mentorEmail}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main content card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Section title={t('projectDetail.goal')} text={project.goal} />
          <Section title={t('projectDetail.keyTasks')} text={project.keyTasks} />
          <Section title={t('projectDetail.value')} text={project.valueText} />
          <Section title={t('projectDetail.requiredSkills')} text={project.requiredSkills} />
          {project.tags && (
            <Box mb={3}>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {t('projectDetail.tags')}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {project.tags.split(',').map((t, i) => (
                  <Chip key={i} label={t.trim()} size="small" variant="outlined" color="primary" />
                ))}
              </Stack>
            </Box>
          )}
          <Section title={t('projectDetail.curriculumMatch')} text={project.curriculumMatch} />
          <Section title={t('projectDetail.responsibilityBoundaries')} text={project.responsibilityBoundaries} />
          <Section title={t('projectDetail.contactPolicy')} text={project.contactPolicy} />
        </CardContent>
      </Card>

      {/* Apply button for students */}
      {user.role === 'STUDENT' && project.status === 'PUBLISHED' && (
        <Button
          variant="contained"
          size="large"
          onClick={() => setApplyOpen(true)}
          sx={{ mb: 4, px: 4 }}
        >
          {t('projectDetail.apply')}
        </Button>
      )}

      {/* Feedback section */}
      {feedback.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: 'warning.main' }} /> {t('projectDetail.feedback')}
          </Typography>
          <Stack spacing={2}>
            {feedback.map(f => (
              <Paper
                key={f.id}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                elevation={0}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Chip label={t(`feedbackType.${f.type}`)} size="small" color={f.type === 'FINAL' ? 'primary' : 'default'} />
                  <Chip
                    label={`${t('projectDetail.rating')}: ${f.rating}/5`}
                    size="small"
                    icon={<Star sx={{ fontSize: 14 }} />}
                    color="warning"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {f.studentName}
                  </Typography>
                </Stack>
                <Typography variant="body2">{f.comment}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Q&A Section */}
      <Box>
        <Typography variant="h5" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuestionAnswer color="primary" /> {t('projectDetail.questionsAnswers')}
        </Typography>

        {/* Questions list */}
        <Stack spacing={2} mb={3}>
          {questions.map(q => (
            <Paper
              key={q.id}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
              elevation={0}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  {q.authorName?.charAt(0)?.toUpperCase() || 'Q'}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={500}>{q.authorName}</Typography>
                {q.visibility === 'PRIVATE' && (
                  <Chip
                    label={t('questionVisibility.PRIVATE')}
                    size="small"
                    color="warning"
                    variant="outlined"
                    icon={<VisibilityOff sx={{ fontSize: 14 }} />}
                  />
                )}
              </Stack>
              <Typography variant="body2" mb={2} sx={{ pl: 4.5 }}>{q.text}</Typography>

              {q.answer ? (
                <Box
                  sx={{
                    ml: 4.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    borderLeft: `3px solid ${theme.palette.secondary.main}`,
                  }}
                >
                  <Typography variant="caption" fontWeight={600} color="secondary.main" sx={{ display: 'block', mb: 0.5 }}>
                    {q.answer.responderName}
                  </Typography>
                  <Typography variant="body2">{q.answer.text}</Typography>
                </Box>
              ) : isMentorOrAdmin ? (
                <Box sx={{ ml: 4.5, mt: 1 }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={t('projectDetail.answerPlaceholder')}
                      value={answerTexts[q.id] || ''}
                      onChange={e => setAnswerTexts({ ...answerTexts, [q.id]: e.target.value })}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAnswer(q.id)}
                      endIcon={<Send />}
                    >
                      {t('common.submit')}
                    </Button>
                  </Stack>
                </Box>
              ) : null}
            </Paper>
          ))}

          {questions.length === 0 && (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                border: `1px dashed ${theme.palette.divider}`,
                bgcolor: 'transparent',
              }}
              elevation={0}
            >
              <Typography variant="body2" color="text.secondary">
                {t('projectDetail.noQuestions')}
              </Typography>
            </Paper>
          )}
        </Stack>

        {/* Ask a question */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
          elevation={0}
        >
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            {t('projectDetail.askQuestion')}
          </Typography>
          <Stack spacing={2}>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder={t('projectDetail.questionPlaceholder')}
              value={qText}
              onChange={e => setQText(e.target.value)}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select
                size="small"
                value={qVisibility}
                onChange={e => setQVisibility(e.target.value)}
                sx={{ minWidth: 140 }}
                InputProps={{
                  startAdornment: qVisibility === 'PUBLIC'
                    ? <Visibility sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    : <VisibilityOff sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />,
                }}
              >
                <MenuItem value="PUBLIC">{t('questionVisibility.PUBLIC')}</MenuItem>
                <MenuItem value="PRIVATE">{t('questionVisibility.PRIVATE')}</MenuItem>
              </TextField>
              <Button
                variant="contained"
                onClick={handleAskQuestion}
                endIcon={<Send />}
                disabled={!qText.trim()}
              >
                {t('common.submit')}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Apply dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('projectDetail.applyTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('projectDetail.applyMessage')}
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder={t('projectDetail.applyPlaceholder')}
            value={applyMsg}
            onChange={e => setApplyMsg(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setApplyOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleApply}>{t('common.submit')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Section({ title, text }) {
  if (!text) return null;
  return (
    <Box mb={3}>
      <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        {text}
      </Typography>
    </Box>
  );
}
