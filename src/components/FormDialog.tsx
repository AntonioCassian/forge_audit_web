import { FormEvent, ReactNode, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { getErrorMessage } from '../services/api';

interface FormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  submitDisabled?: boolean;
  onClose: () => void;
  /** Deve lançar erro em caso de falha; o diálogo exibe a mensagem e permanece aberto. */
  onSubmit: () => Promise<void>;
  children: ReactNode;
}

/** Casca padrão dos modais de formulário: título, erro da API, estado de envio e botões. */
export default function FormDialog({
  open,
  title,
  submitLabel,
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
}: FormDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit, noValidate: true } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <div className="flex flex-col gap-4 pt-2">
          {error && <Alert severity="error">{error}</Alert>}
          {children}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={submitDisabled || submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
