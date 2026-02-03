import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState('success');

  const showSnackbar = useCallback((message, sev = 'success') => {
    setMsg(message);
    setSeverity(sev);
    setOpen(true);
  }, []);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}
