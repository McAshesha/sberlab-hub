import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Divider, Chip, Tooltip, Avatar,
  useTheme, alpha,
} from '@mui/material';
import {
  Menu as MenuIcon, Home, Assignment, Dashboard, People,
  FolderSpecial, Logout, ListAlt, LightMode, DarkMode,
  ChevronLeft, ChevronRight, Translate,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 72;

export default function Layout() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { language, toggleLanguage, t } = useLanguage();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: t('nav.catalog'), icon: <Home />, path: '/', roles: null },
    { label: t('nav.myApplications'), icon: <Assignment />, path: '/my-applications', roles: ['STUDENT'] },
    { label: t('nav.mentorDashboard'), icon: <Dashboard />, path: '/mentor', roles: ['MENTOR', 'ADMIN'] },
    { label: t('nav.manageUsers'), icon: <People />, path: '/admin/users', roles: ['ADMIN'] },
    { label: t('nav.manageProjects'), icon: <FolderSpecial />, path: '/admin/projects', roles: ['ADMIN'] },
    { label: t('nav.allowList'), icon: <ListAlt />, path: '/admin/allow-list', roles: ['ADMIN'] },
  ].filter(item => !item.roles || item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MENTOR': return 'primary';
      case 'TEACHER': return 'secondary';
      default: return 'default';
    }
  };

  const currentDrawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (isMobile = false) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: collapsed && !isMobile ? 1.5 : 2.5, py: 2, justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}>
        {collapsed && !isMobile ? (
          <Box
            component="img"
            src="/logos/sberbank.png"
            alt="Sber"
            sx={{ height: 28, width: 'auto', objectFit: 'contain' }}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logos/sberbank.png"
              alt="Sber"
              sx={{ height: 28, width: 'auto', objectFit: 'contain' }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SberLab Hub
            </Typography>
          </Box>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ px: collapsed && !isMobile ? 1 : 1, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => (
          <Tooltip
            key={item.path}
            title={collapsed && !isMobile ? item.label : ''}
            placement="right"
            arrow
          >
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                mb: 0.5,
                minHeight: 48,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                px: collapsed && !isMobile ? 2 : 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed && !isMobile ? 0 : 40,
                  mr: collapsed && !isMobile ? 0 : 2,
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    fontSize: '0.9375rem',
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider />
      {/* Collapse toggle button - only on desktop */}
      {!isMobile && (
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
          <Tooltip title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')} placement="right">
            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
              }}
            >
              {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Mobile menu button */}
          <IconButton
            edge="start"
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo section - visible on mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logos/sberbank.png"
              alt="Sber"
              sx={{ height: 24, width: 'auto' }}
            />
          </Box>

          {/* Partner logos - desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            <Tooltip title="Sberbank">
              <Box
                component="img"
                src="/logos/sberbank.png"
                alt="Sberbank"
                sx={{ height: 28, width: 'auto', cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="NSU">
              <Box
                component="img"
                src="/logos/nsu.png"
                alt="NSU"
                sx={{ height: 32, width: 'auto', cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="SberTech">
              <Box
                component="img"
                src="/logos/sbertech.png"
                alt="SberTech"
                sx={{ height: 24, width: 'auto', cursor: 'pointer' }}
              />
            </Tooltip>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Theme toggle */}
            <Tooltip title={mode === 'light' ? t('theme.darkMode') : t('theme.lightMode')}>
              <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            {/* Language toggle */}
            <Tooltip title={t('theme.changeLanguage')}>
              <IconButton onClick={toggleLanguage} sx={{ color: 'text.secondary' }}>
                <Translate />
              </IconButton>
            </Tooltip>

            {user && (
              <>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                {/* User info */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                    <Typography variant="body2" fontWeight={500} lineHeight={1.2}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t(`roles.${user.role}`)}
                    </Typography>
                  </Box>
                  <Chip
                    label={t(`roles.${user.role}`)}
                    size="small"
                    color={roleColor(user.role)}
                    variant="outlined"
                    sx={{ display: { xs: 'none', sm: 'flex', lg: 'none' }, fontWeight: 500 }}
                  />
                </Box>

                {/* Logout button */}
                <Tooltip title={t('nav.logout')}>
                  <IconButton onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                    <Logout fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent(true)}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent(false)}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          minHeight: '100vh',
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
