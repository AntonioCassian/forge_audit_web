
import Chip from '@mui/material/Chip';
import type { MachineStatus, OrderStatus } from '../types';

type Status = MachineStatus | OrderStatus;

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string }
> = {
  OPERATIONAL: {
    label: 'Operacional',
    color: '#1B5E20',
    bg: '#E4F2E5',
  },
  MAINTENANCE: {
    label: 'Em manutenção',
    color: '#8A5300',
    bg: '#FFF1D6',
  },
  STOPPED_DUE_TO_FAILURE: {
    label: 'Parada por falha',
    color: '#9B1C1C',
    bg: '#FBE3E3',
  },
  // FAILED: {
  //   label: 'Falha',
  //   color: '#9B1C1C',
  //   bg: '#FBE3E3',
  // },
  PLANNED: {
    label: 'Planejada',
    color: '#37474F',
    bg: '#E3E8ED',
  },
  IN_PROGRESS: {
    label: 'Em produção',
    color: '#0D47A1',
    bg: '#E1EDFB',
  },
  SUSPENDED: {
    label: 'Suspensa',
    color: '#8A5300',
    bg: '#FFF1D6',
  },
  COMPLETED: {
    label: 'Concluída',
    color: '#1B5E20',
    bg: '#E4F2E5',
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    console.warn('Status não encontrado:', status);

    return (
      <Chip
        size="small"
        label={String(status ?? 'Desconhecido')}
        sx={{ bgcolor: '#EEEEEE', color: '#616161', fontWeight: 600 }}
      />
    );
  }

  const { label, color, bg } = config;

  return (
    <Chip
      size="small"
      label={label}
      icon={
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      }
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 600,
        '& .MuiChip-icon': { ml: 1, mr: -0.25 },
      }}
    />
  );
}
