import { useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormDialog from './FormDialog';
import { STATUS_CONFIG } from './StatusBadge';
import { CreateMachineDTO, MACHINE_STATUSES, MachineStatus } from '../types';

interface MachineFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateMachineDTO) => Promise<void>;
}

export default function MachineFormModal({ open, onClose, onSubmit }: MachineFormModalProps) {
  const [name, setName] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [status, setStatus] = useState<MachineStatus>('OPERATIONAL');

  useEffect(() => {
    if (open) {
      setName('');
      setAssetCode('');
      setStatus('OPERATIONAL');
    }
  }, [open]);

  return (
    <FormDialog
      open={open}
      title="Nova máquina"
      submitLabel="Cadastrar máquina"
      submitDisabled={!name.trim() || !assetCode.trim()}
      onClose={onClose}
      onSubmit={() => onSubmit({ name: name.trim(), assetCode: assetCode.trim(), status })}
    >
      <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth autoFocus />
      <TextField
        label="Código de patrimônio"
        value={assetCode}
        onChange={(e) => setAssetCode(e.target.value)}
        required
        fullWidth
      />
      <TextField
        select
        label="Status inicial"
        value={status}
        onChange={(e) => setStatus(e.target.value as MachineStatus)}
        fullWidth
      >
        {MACHINE_STATUSES.map((s) => (
          <MenuItem key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </MenuItem>
        ))}
      </TextField>
    </FormDialog>
  );
}
