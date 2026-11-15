import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1F3A5F', dark: '#17263A', light: '#3E5F8A' },
    secondary: { main: '#546E7A' },
    success: { main: '#2E7D32' },
    warning: { main: '#B26A00' },
    error: { main: '#C62828' },
    info: { main: '#1565C0' },
    background: { default: '#EEF1F4', paper: '#FFFFFF' },
    text: { primary: '#1B2530', secondary: '#55616E' },
    divider: '#D5DBE1',
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Roboto, sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #D5DBE1' } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 600, backgroundColor: '#E3E8ED' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
