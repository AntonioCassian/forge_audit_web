import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/api';

const REASON_MESSAGE: Record<string, string> = {
  idle: 'Sua sessão foi encerrada após 5 minutos sem atividade. Entre novamente para continuar.',
  expired: 'Sua sessão expirou. Entre novamente para continuar.',
};

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/machines';
    return <Navigate to={from} replace />;
  }

  const reasonMessage = REASON_MESSAGE[params.get('reason') ?? ''];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err, 'E-mail ou senha incorretos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Paper className="w-full max-w-sm p-8">
        <Typography variant="h5">ForgeAudit</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Acesso restrito a usuários cadastrados por um supervisor.
        </Typography>

        {reasonMessage && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {reasonMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <TextField label="E-mail" type="email" autoComplete="username" required fullWidth autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Senha" type="password" autoComplete="current-password" required fullWidth
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="contained" size="large" disabled={loading || !email || !password}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </div>
  );
}
