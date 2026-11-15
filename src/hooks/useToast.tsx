import { ReactNode, useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

type Severity = 'success' | 'error';

interface ToastState {
  open: boolean;
  message: string;
  severity: Severity;
}

export function useToast(): { notify: (message: string, severity?: Severity) => void; toast: ReactNode } {
  const [state, setState] = useState<ToastState>({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message: string, severity: Severity = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  const toast = (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={state.severity} variant="filled" onClose={() => setState((s) => ({ ...s, open: false }))}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { notify, toast };
}
