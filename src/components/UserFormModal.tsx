import { useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormDialog from './FormDialog';
import { ROLE_LABEL } from '../auth/permissions';
import { CreateUserDTO, ROLES, Role } from '../types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateUserDTO) => Promise<void>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export default function UserFormModal({ open, onClose, onSubmit }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('OPERATOR');

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('OPERATOR');
    }
  }, [open]);

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const passwordValid = password.length >= MIN_PASSWORD;

  return (
    <FormDialog
      open={open}
      title="Novo usuário"
      submitLabel="Cadastrar usuário"
      submitDisabled={!name.trim() || !emailValid || !passwordValid}
      onClose={onClose}
      onSubmit={() => onSubmit({ name: name.trim(), email: email.trim(), password, role })}
    >
      <TextField label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required fullWidth autoFocus />
      <TextField
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        error={email !== '' && !emailValid}
        helperText={email !== '' && !emailValid ? 'Informe um e-mail válido.' : undefined}
      />
      <TextField
        label="Senha inicial"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        error={password !== '' && !passwordValid}
        helperText={`Mínimo de ${MIN_PASSWORD} caracteres.`}
      />
      <TextField select label="Cargo" value={role} onChange={(e) => setRole(e.target.value as Role)} fullWidth>
        {ROLES.map((r) => (
          <MenuItem key={r} value={r}>
            {ROLE_LABEL[r]}
          </MenuItem>
        ))}
      </TextField>
    </FormDialog>
  );
}
