import { createTheme, alpha } from '@mui/material/styles';

// Modern blue + green + gray palette (no acid colors)
const palette = {
  primary: {
    main: '#2563eb',      // Modern blue
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#16a34a',      // Balanced green (Sber-inspired)
    light: '#22c55e',
    dark: '#15803d',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

const lightPalette = {
  mode: 'light',
  ...palette,
  background: {
    default: '#f1f5f9',
    paper: '#ffffff',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
  },
  divider: alpha('#94a3b8', 0.2),
};

const darkPalette = {
  mode: 'dark',
  ...palette,
  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
  },
  divider: alpha('#94a3b8', 0.15),
};

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  h1: { fontWeight: 700, letterSpacing: '-0.025em' },
  h2: { fontWeight: 700, letterSpacing: '-0.025em' },
  h3: { fontWeight: 600, letterSpacing: '-0.02em' },
  h4: { fontWeight: 600, letterSpacing: '-0.02em' },
  h5: { fontWeight: 600, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 500 },
  button: { fontWeight: 600, letterSpacing: '0.01em' },
};

const shape = { borderRadius: 12 };

const createComponents = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: 8, height: 8 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: mode === 'dark' ? '#475569' : '#cbd5e1',
          borderRadius: 4,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 10,
        padding: '8px 20px',
        transition: 'all 0.2s ease-in-out',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: mode === 'dark'
            ? '0 4px 12px rgba(59, 130, 246, 0.3)'
            : '0 4px 12px rgba(37, 99, 235, 0.25)',
          transform: 'translateY(-1px)',
        },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': { borderWidth: 1.5 },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: mode === 'dark'
          ? '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : 'none',
        transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: mode === 'dark'
          ? '0 1px 3px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.06)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backdropFilter: 'blur(8px)',
        backgroundColor: mode === 'dark'
          ? alpha('#1e293b', 0.9)
          : alpha('#ffffff', 0.9),
        borderBottom: `1px solid ${mode === 'dark' ? alpha('#94a3b8', 0.1) : alpha('#94a3b8', 0.15)}`,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${mode === 'dark' ? alpha('#94a3b8', 0.1) : alpha('#94a3b8', 0.15)}`,
        backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        margin: '2px 8px',
        '&.Mui-selected': {
          backgroundColor: mode === 'dark'
            ? alpha('#3b82f6', 0.15)
            : alpha('#2563eb', 0.08),
          '&:hover': {
            backgroundColor: mode === 'dark'
              ? alpha('#3b82f6', 0.2)
              : alpha('#2563eb', 0.12),
          },
        },
        '&:hover': {
          backgroundColor: mode === 'dark'
            ? alpha('#94a3b8', 0.08)
            : alpha('#94a3b8', 0.08),
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: 8,
      },
      outlined: {
        borderWidth: 1.5,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
              : '0 0 0 3px rgba(37, 99, 235, 0.06)',
          },
          '&.Mui-focused': {
            boxShadow: mode === 'dark'
              ? '0 0 0 3px rgba(59, 130, 246, 0.2)'
              : '0 0 0 3px rgba(37, 99, 235, 0.12)',
          },
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: mode === 'dark'
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 600,
          backgroundColor: mode === 'dark' ? '#0f172a' : '#f8fafc',
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td': { borderBottom: 0 },
        '&:hover': {
          backgroundColor: mode === 'dark'
            ? alpha('#94a3b8', 0.04)
            : alpha('#94a3b8', 0.04),
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.8125rem',
        padding: '8px 12px',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
});

export function createAppTheme(mode) {
  return createTheme({
    palette: mode === 'dark' ? darkPalette : lightPalette,
    typography,
    shape,
    components: createComponents(mode),
  });
}

// Default export for backwards compatibility
export default createAppTheme('light');
