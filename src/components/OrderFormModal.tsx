import { useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormDialog from './FormDialog';
import { STATUS_CONFIG } from './StatusBadge';
import type { CreateProductionOrderDTO, Machine } from '../types';

interface OrderFormModalProps {
  open: boolean;
  machines: Machine[];
  onClose: () => void;
  onSubmit: (dto: CreateProductionOrderDTO) => Promise<void>;
}

export default function OrderFormModal({ open, machines, onClose, onSubmit }: OrderFormModalProps) {
  const [productionCode, setProductionCode] = useState('');
  const [machineId, setMachineId] = useState('');
  const [planned, setPlanned] = useState('');

  useEffect(() => {
    if (open) {
      setProductionCode('');
      setMachineId('');
      setPlanned('');
    }
  }, [open]);

  const plannedQuantity = Number(planned);
  const plannedValid = planned !== '' && Number.isInteger(plannedQuantity) && plannedQuantity > 0;

  return (
    <FormDialog
      open={open}
      title="Nova ordem de produção"
      submitLabel="Criar ordem"
      submitDisabled={!productionCode.trim() || !machineId || !plannedValid}
      onClose={onClose}
      onSubmit={() => onSubmit({ productionCode: productionCode.trim(), machineId, plannedQuantity })}
    >
      <TextField
        label="Código do lote"
        value={productionCode}
        onChange={(e) => setProductionCode(e.target.value)}
        required
        fullWidth
        autoFocus
      />
      <TextField
        select
        label="Máquina"
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        required
        fullWidth
        helperText={machines.length === 0 ? 'Cadastre uma máquina antes de criar ordens.' : undefined}
      >
        {machines.map((m) => (
          <MenuItem key={m.id} value={m.id}>
            {m.name} ({m.assetCode}) · {STATUS_CONFIG[m.status].label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Quantidade planejada"
        type="number"
        value={planned}
        onChange={(e) => setPlanned(e.target.value)}
        required
        fullWidth
        error={planned !== '' && !plannedValid}
        helperText={planned !== '' && !plannedValid ? 'Informe um número inteiro maior que zero.' : undefined}
        slotProps={{ htmlInput: { min: 1, step: 1 } }}
      />
    </FormDialog>
  );
}
