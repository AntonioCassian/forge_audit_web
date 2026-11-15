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
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Can from '../components/Can';
import MachineFormModal from '../components/MachineFormModal';
import PageHeader from '../components/PageHeader';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../services/api';
import { machineService } from '../services/machineService';
import { CreateMachineDTO, Machine, MACHINE_STATUSES, MachineStatus } from '../types';

export default function MachinesPage() {
  const { can } = useAuth();
  const canUpdateStatus = can('machines:updateStatus');
  const { notify, toast } = useToast();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setMachines(await machineService.list());
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Não foi possível carregar as máquinas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (dto: CreateMachineDTO) => {
    const created = await machineService.create(dto);
    setMachines((prev) => [created, ...prev]);
    setModalOpen(false);
    notify(`Máquina ${created.name} cadastrada.`);
  };

  

const handleStatusChange = async (
  machine: Machine,
  status: MachineStatus
) => {
  if (status === machine.status) return;

  setBusyId(machine.id);

  try {
    await machineService.updateStatus(machine.id, status);

    setMachines((prev) =>
      prev.map((m) =>
        m.id === machine.id ? { ...m, status } : m
      )
    );

    notify(
      `${machine.name}: status alterado para ${STATUS_CONFIG[status].label.toLowerCase()}.`
    );
  } catch (err) {
    notify(getErrorMessage(err), 'error');
  } finally {
    setBusyId(null);
  }
};



  return (
    <>
      <PageHeader
        title="Máquinas"
        description="Equipamentos da planta e situação operacional."
        action={
          <Can permission="machines:create">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              Nova Máquina
            </Button>
          </Can>
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
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Código de patrimônio</TableCell>
                <TableCell>Status</TableCell>
                {canUpdateStatus && <TableCell>Alterar status</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {machines.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{m.name}</TableCell>
                  <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{m.assetCode}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  {canUpdateStatus && (
                    <TableCell>
                      <Select
                        size="small"
                        value={m.status}
                        disabled={busyId === m.id}
                        onChange={(e: SelectChangeEvent<MachineStatus>) =>
                          void handleStatusChange(m, e.target.value as MachineStatus)
                        }
                        inputProps={{ 'aria-label': ` de ${m.name}` }}
                        sx={{ minWidth: 170 }}
                      >
                        {MACHINE_STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!loading && !loadError && machines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canUpdateStatus ? 4 : 3}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Nenhuma máquina cadastrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Can permission="machines:create">
        <MachineFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      </Can>
      {toast}
    </>
  );
}
