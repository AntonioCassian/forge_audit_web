import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/PageHeader';
import UserFormModal from '../components/UserFormModal';
import { ROLE_LABEL } from '../auth/permissions';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../services/api';
import { userService } from '../services/userService';
import { CreateUserDTO, ROLES, Role, User } from '../types';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { notify, toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setUsers(await userService.list());
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Não foi possível carregar os usuários.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (dto: CreateUserDTO) => {
    const created = await userService.create(dto);
    setUsers((prev) => [created, ...prev]);
    setModalOpen(false);
    notify(`Usuário ${created.name} cadastrado.`);
  };

  const handleRoleChange = async (target: User, role: Role) => {
    if (role === target.role) return;
    setBusyId(target.id);
    try {
      const updated = await userService.updateRole(target.id, role);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
      notify(`${target.name} agora é ${ROLE_LABEL[role].toLowerCase()}.`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Cadastro de acessos e definição de cargos. Não há auto-cadastro."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
            Novo Usuário
          </Button>
        }
      />

      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void load()}>
              Tentar novamente
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Cargo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Tooltip title={isSelf ? 'Você não pode alterar o próprio cargo.' : ''}>
                        <span>
                          <Select
                            size="small"
                            value={u.role}
                            disabled={isSelf || busyId === u.id}
                            onChange={(e: SelectChangeEvent<Role>) => void handleRoleChange(u, e.target.value as Role)}
                            inputProps={{ 'aria-label': `Alterar cargo de ${u.name}` }}
                            sx={{ minWidth: 160 }}
                          >
                            {ROLES.map((r) => (
                              <MenuItem key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </MenuItem>
                            ))}
                          </Select>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && !loadError && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Nenhum usuário cadastrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      {toast}
    </>
  );
}
