import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import FormDialog from './FormDialog';
import type { ProductionOrder } from '../types';

interface OrderQuantityDialogProps {
  order: ProductionOrder | null;
  onClose: () => void;
  onSubmit: (order: ProductionOrder, producedQuantity: number) => Promise<void>;
}

export default function OrderQuantityDialog({ order, onClose, onSubmit }: OrderQuantityDialogProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (order) setValue(String(order.producedQuantity));
  }, [order]);

  const quantity = Number(value);
  const valid =
    !!order && value !== '' && Number.isInteger(quantity) && quantity >= 0 && quantity <= order.plannedQuantity;

  return (
    <FormDialog
      open={!!order}
      title={order ? `Atualizar quantidade · ${order.productionCode}` : 'Atualizar quantidade'}
      submitLabel="Salvar quantidade"
      submitDisabled={!valid}
      onClose={onClose}
      onSubmit={async () => {
        if (order) await onSubmit(order, quantity);
      }}
    >
      <TextField
        label="Quantidade produzida"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
        autoFocus
        error={value !== '' && !valid}
        helperText={
          order
            ? `Planejado: ${order.plannedQuantity}. Informe um inteiro entre 0 e ${order.plannedQuantity}.`
            : undefined
        }
        slotProps={{ htmlInput: { min: 0, max: order?.plannedQuantity, step: 1 } }}
      />
    </FormDialog>
  );
}
