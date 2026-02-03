import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, MenuItem,
  Divider, Stack, IconButton, Tooltip, useTheme, alpha, keyframes,
} from '@mui/material';
import { LightMode, DarkMode, Translate } from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useSnackbar } from '../SnackbarContext';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import api from '../api';

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ROLES = ['STUDENT', 'MENTOR', 'TEACHER', 'ADMIN'];

// Infinite scroll animation
const scrollAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

// Logo carousel component
function LogoCarousel() {
  const logos = [
    { src: '/logos/sberbank.png', alt: 'Sberbank', height: 32 },
    { src: '/logos/nsu.png', alt: 'NSU', height: 38 },
    { src: '/logos/sbertech.png', alt: 'SberTech', height: 28 },
  ];

  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden',
        mb: 4,
        py: 2,
        position: 'relative',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 60,
          zIndex: 1,
          pointerEvents: 'none',
        },
        '&::before': {
          left: 0,
          background: (theme) => `linear-gradient(to right, ${theme.palette.background.paper}, transparent)`,
        },
        '&::after': {
          right: 0,
          background: (theme) => `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: 'max-content',
          animation: `${scrollAnimation} 20s linear infinite`,
          '&:hover': {
            animationPlayState: 'paused',
          },
        }}
      >
        {allLogos.map((logo, i) => (
          <Box
            key={i}
            component="img"
            src={logo.src}
            alt={logo.alt}
            sx={{
              height: logo.height,
              width: 'auto',
              opacity: 0.75,
              transition: 'opacity 0.2s, transform 0.2s',
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.05)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const { mode, toggleTheme } = useThemeMode();
  const { language, toggleLanguage, t } = useLanguage();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleGoogleCallback = useCallback(async (response) => {
    try {
      const data = await api.post('/api/auth/google', { idToken: response.credential });
      login(data.token, data.user);
      showSnackbar('Logged in with Google');
      navigate('/');
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  }, [login, navigate, showSnackbar]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const renderGoogleButton = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      const btn = document.getElementById('google-signin-btn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: mode === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          width: 320,
        });
      }
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (script) {
        const onLoad = () => { renderGoogleButton(); script.removeEventListener('load', onLoad); };
        script.addEventListener('load', onLoad);
        return () => script.removeEventListener('load', onLoad);
      }
    }
  }, [handleGoogleCallback, mode]);

  const handleDevLogin = async () => {
    if (!email.trim()) { showSnackbar('Email is required', 'warning'); return; }
    try {
      const data = await api.post('/api/auth/dev-login', { email, name: name || email.split('@')[0], role });
      login(data.token, data.user);
      showSnackbar(`Logged in as ${data.user.name} (${data.user.role})`);
      navigate('/');
    } catch (e) {
      showSnackbar(e.message, 'error');
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${theme.palette.background.default} 50%, ${alpha(theme.palette.secondary.dark, 0.2)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)} 0%, ${theme.palette.background.default} 50%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        position: 'relative',
      }}
    >
      {/* Theme and Language toggles */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
        <Tooltip title={mode === 'light' ? t('theme.darkMode') : t('theme.lightMode')}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t('theme.changeLanguage')}>
          <IconButton
            onClick={toggleLanguage}
            sx={{
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <Translate />
          </IconButton>
        </Tooltip>
      </Box>

      <Card sx={{ width: { xs: '90%', sm: 420 }, p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {/* Logo carousel */}
          <LogoCarousel />

          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('login.title')}
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" mb={4}>
            {t('login.subtitle')}
          </Typography>

          {!DEV_AUTH && (
            <Box display="flex" justifyContent="center" mb={2}>
              <div id="google-signin-btn" />
            </Box>
          )}

          {DEV_AUTH && (
            <>
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  borderRadius: 2,
                  p: 1.5,
                  mb: 3,
                }}
              >
                <Typography variant="caption" color="warning.main" fontWeight={600} textAlign="center" display="block">
                  {t('login.devLoginTitle')}
                </Typography>
              </Box>
              <Stack spacing={2.5}>
                <TextField
                  label={t('login.email')}
                  size="small"
                  fullWidth
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@example.com"
                />
                <TextField
                  label="Name (optional)"
                  size="small"
                  fullWidth
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <TextField
                  label={t('login.selectRole')}
                  size="small"
                  select
                  fullWidth
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  {ROLES.map(r => <MenuItem key={r} value={r}>{t(`roles.${r}`)}</MenuItem>)}
                </TextField>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleDevLogin}
                  sx={{ py: 1.5 }}
                >
                  {t('login.devLogin')}
                </Button>
              </Stack>
              {GOOGLE_CLIENT_ID && (
                <>
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary">or</Typography>
                  </Divider>
                  <Box display="flex" justifyContent="center">
                    <div id="google-signin-btn" />
                  </Box>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
