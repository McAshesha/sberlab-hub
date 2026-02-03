import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Card, CardContent, CardActions, Button, TextField,
  Box, Chip, MenuItem, FormControlLabel, Checkbox, Pagination, Stack,
  InputAdornment, useTheme, alpha, Collapse, Paper,
} from '@mui/material';
import { Search, FilterList, ArrowForward, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const DIFFICULTIES = ['', 'EASY', 'MEDIUM', 'HARD'];

export default function CatalogPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState(''); // What user is typing
  const [q, setQ] = useState(''); // Actual search query sent to backend
  const [difficulty, setDifficulty] = useState('');
  const [thesis, setThesis] = useState(false);
  const [practice, setPractice] = useState(false);
  const [coursework, setCoursework] = useState(false);
  const [tags, setTags] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const size = 12;

  // Debounce search input: update q after 500ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle Enter key to trigger search immediately
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setQ(searchInput);
      setPage(0);
    }
  };

  const fetchProjects = useCallback(async () => {
    const params = new URLSearchParams({ page, size });
    if (q) params.set('q', q);
    if (difficulty) params.set('difficulty', difficulty);
    if (thesis) params.set('thesis', 'true');
    if (practice) params.set('practice', 'true');
    if (coursework) params.set('coursework', 'true');
    if (tags) params.set('tags', tags);
    const data = await api.get(`/api/projects?${params}`);
    setProjects(data.items);
    setTotal(data.total);
  }, [page, q, difficulty, thesis, practice, coursework, tags]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const difficultyColor = (d) => {
    if (d === 'EASY') return 'success';
    if (d === 'HARD') return 'error';
    return 'warning';
  };

  const activeFiltersCount = [difficulty, thesis, practice, coursework, tags].filter(Boolean).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('catalog.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('catalog.subtitle')}
        </Typography>
      </Box>

      {/* Search and filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            placeholder={t('catalog.searchPlaceholder')}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 130 }}
          >
            {t('common.filters')}
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, minWidth: 20, '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
          </Button>
        </Stack>

        <Collapse in={showFilters}>
          <Stack
            direction="row"
            spacing={2}
            mt={2.5}
            pt={2.5}
            flexWrap="wrap"
            alignItems="center"
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            useFlexGap
          >
            <TextField
              select
              size="small"
              label={t('difficulty.difficulty')}
              value={difficulty}
              onChange={e => { setDifficulty(e.target.value); setPage(0); }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">{t('difficulty.allLevels')}</MenuItem>
              {DIFFICULTIES.filter(Boolean).map(d => (
                <MenuItem key={d} value={d}>
                  <Chip size="small" label={t(`difficulty.${d}`)} color={difficultyColor(d)} sx={{ mr: 1 }} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label={t('catalog.tags')}
              value={tags}
              placeholder={t('catalog.tagsPlaceholder')}
              onChange={e => { setTags(e.target.value); setPage(0); }}
              sx={{ minWidth: 140 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={thesis}
                  onChange={e => { setThesis(e.target.checked); setPage(0); }}
                  color="secondary"
                />
              }
              label={t('projectTypes.thesis')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={practice}
                  onChange={e => { setPractice(e.target.checked); setPage(0); }}
                  color="secondary"
                />
              }
              label={t('projectTypes.practice')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={coursework}
                  onChange={e => { setCoursework(e.target.checked); setPage(0); }}
                  color="secondary"
                />
              }
              label={t('projectTypes.coursework')}
            />
          </Stack>
        </Collapse>
      </Paper>

      {/* Results count */}
      {total > 0 && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t('catalog.found')} {total} {total === 1 ? t('catalog.project') : t('catalog.projects')}
        </Typography>
      )}

      {/* Project grid */}
      <Grid container spacing={3}>
        {projects.map(p => (
          <Grid item xs={12} sm={6} lg={4} key={p.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.4)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '3.6em',
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={2}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '4.5em',
                  }}
                >
                  {p.goal || t('catalog.noDescription')}
                </Typography>

                <Stack direction="row" spacing={0.75} flexWrap="wrap" mb={2} useFlexGap>
                  <Chip
                    size="small"
                    label={t(`difficulty.${p.difficulty}`)}
                    color={difficultyColor(p.difficulty)}
                    sx={{ fontWeight: 500 }}
                  />
                  {p.thesisOk && <Chip size="small" label={t('projectTypes.thesis')} variant="outlined" />}
                  {p.practiceOk && <Chip size="small" label={t('projectTypes.practice')} variant="outlined" />}
                  {p.courseworkOk && <Chip size="small" label={t('projectTypes.coursework')} variant="outlined" />}
                </Stack>

                {p.tags && (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={2} useFlexGap>
                    {p.tags.split(',').slice(0, 3).map((t, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={t.trim()}
                        variant="outlined"
                        color="primary"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                    {p.tags.split(',').length > 3 && (
                      <Chip
                        size="small"
                        label={`+${p.tags.split(',').length - 3}`}
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Stack>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'secondary.main',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {p.mentorName?.charAt(0)?.toUpperCase() || 'M'}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('catalog.mentor')}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {p.mentorName}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{ ml: 'auto' }}
                >
                  {t('catalog.viewDetails')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty state */}
      {projects.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: 'transparent',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('catalog.noProjects')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('catalog.tryAdjusting')}
          </Typography>
        </Paper>
      )}

      {/* Pagination */}
      {total > size && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(total / size)}
            page={page + 1}
            onChange={(_, v) => setPage(v - 1)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
