
import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AuditDiffModal from '../components/AuditDiffModal';
import PageHeader from '../components/PageHeader';

import { getErrorMessage } from '../services/api';
import { auditService } from '../services/auditService';

import {
  AUDIT_RESOURCES,
  AuditLog,
  AuditResource,
} from '../types';

// ========================================
// LABELS
// ========================================

const RESOURCE_LABEL: Record<string, string> = {
  Machine: 'Máquina',
  ProductionOrder: 'Ordem de produção',
  User: 'Usuário',

  maquina: 'Máquina',
  ordem_producao: 'Ordem de produção',
  usuario: 'Usuário',
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
};

const ROLE_LABEL: Record<string, string> = {
  OPERATOR: 'Operador',
  SUPERVISOR: 'Supervisor',
  AUDITOR: 'Auditor',
};

const RESOURCE_MAP: Record<string, AuditResource> = {
  Machine: 'Machine',
  ProductionOrder: 'ProductionOrder',
  User: 'User',

  maquina: 'Machine',
  ordem_producao: 'ProductionOrder',
  usuario: 'User',
};

const getResourceLabel = (resource?: string) =>
  RESOURCE_LABEL[resource ?? ''] ?? resource ?? 'Não informado';

const getActionLabel = (action?: string) =>
  ACTION_LABEL[action ?? ''] ?? action ?? 'Não informado';

const getRoleLabel = (role?: string) =>
  ROLE_LABEL[role ?? ''] ?? role ?? 'Não informado';

// ========================================
// NORMALIZAÇÃO PARA O MODAL
// ========================================

function normalizeLog(log: AuditLog): AuditLog {
  const raw = log as any;

  const resource =
    raw.affectedEntity ??
    raw.resource ??
    '';

  const role =
    raw.role ??
    raw.user?.role ??
    '';

  const userId =
    raw.userId ??
    raw.user?.id ??
    '';

  const userName =
    raw.userName ??
    raw.user?.name ??
    'Usuário não identificado';

  return {
    id: raw.id,

    resource:
      RESOURCE_MAP[resource] ??
      raw.resource ??
      'ProductionOrder',

    resourceId:
      raw.affectedRecordId ??
      raw.resourceId ??
      '',

    action: raw.action,

    oldValues:
      raw.previousData ??
      raw.oldValues ??
      null,

    newValues:
      raw.newData ??
      raw.newValues ??
      null,

    ipAddress:
      raw.sourceIp ??
      raw.ipAddress ??
      '',

    createdAt:
      raw.dateTime ??
      raw.createdAt ??
      '',

    user: {
      id: userId,
      name: userName,
      email: raw.user?.email ?? '',
      role: role as AuditLog['user']['role'],
    },
  };
}

// ========================================
// COMPONENT
// ========================================

export default function AuditLogsPage() {
  const [resource, setResource] = useState<AuditResource | ''>('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AuditLog | null>(null);

  const invalidRange =
    !!dateFrom &&
    !!dateTo &&
    dateFrom > dateTo;

  // ========================================
  // LOAD AUDIT LOGS
  // ========================================

  useEffect(() => {
    if (invalidRange) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    auditService
      .list({
        page: page + 1,
        pageSize: rowsPerPage,
        resource: resource || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      .then((res) => {
        if (cancelled) return;

        const normalizedRows = (res.data ?? []).map(normalizeLog);

        setRows(normalizedRows);
        setTotal(res.total ?? normalizedRows.length);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          getErrorMessage(
            err,
            'Não foi possível carregar a trilha de auditoria.'
          )
        );

        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    page,
    rowsPerPage,
    resource,
    dateFrom,
    dateTo,
    invalidRange,
  ]);

  // ========================================
  // FILTER HANDLER
  // ========================================

  const onFilterChange =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(0);
    };

  // ========================================
  // OPEN MODAL
  // ========================================

  const handleOpenModal = (log: AuditLog) => {
    setSelected(normalizeLog(log));
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      <PageHeader
        title="Trilha de auditoria"
        description="Registros de quem alterou o quê. Clique em uma linha para visualizar os dados anteriores e posteriores."
      />

      {/* FILTROS */}

      <Paper className="mb-4 flex flex-wrap items-start gap-4 p-4">

        <TextField
          select
          size="small"
          label="Recurso"
          value={resource}
          onChange={(e) =>
            onFilterChange(setResource)(
              e.target.value as AuditResource | ''
            )
          }
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">
            Todos
          </MenuItem>

          {AUDIT_RESOURCES.map((r) => (
            <MenuItem key={r} value={r}>
              {getResourceLabel(r)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          type="date"
          label="De"
          value={dateFrom}
          onChange={(e) =>
            onFilterChange(setDateFrom)(e.target.value)
          }
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          size="small"
          type="date"
          label="Até"
          value={dateTo}
          onChange={(e) =>
            onFilterChange(setDateTo)(e.target.value)
          }
          error={invalidRange}
          helperText={
            invalidRange
              ? 'A data final deve ser igual ou posterior à inicial.'
              : undefined
          }
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

      </Paper>

      {/* ERRO */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* TABELA */}

      <Paper>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>
                <TableCell>Data e hora</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Recurso</TableCell>
                <TableCell>ID do recurso</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              {rows.map((log) => {
                const date = log.createdAt
                  ? new Date(log.createdAt)
                  : null;

                const validDate =
                  date && !Number.isNaN(date.getTime());

                return (
                  <TableRow
                    key={log.id}
                    hover
                    tabIndex={0}
                    onClick={() => handleOpenModal(log)}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' ||
                        e.key === ' '
                      ) {
                        e.preventDefault();
                        handleOpenModal(log);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                    }}
                  >

                    {/* DATA */}

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {validDate
                        ? date.toLocaleString('pt-BR')
                        : 'Não informado'}
                    </TableCell>

                    {/* RESPONSÁVEL */}

                    <TableCell>
                      {log.user?.name || 'Usuário não identificado'}
                    </TableCell>

                    {/* PERFIL */}

                    <TableCell>
                      {getRoleLabel(log.user?.role)}
                    </TableCell>

                    {/* AÇÃO */}

                    <TableCell>
                      {getActionLabel(log.action)}
                    </TableCell>

                    {/* RECURSO */}

                    <TableCell>
                      {getResourceLabel(log.resource)}
                    </TableCell>

                    {/* ID */}

                    <TableCell
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 13,
                      }}
                    >
                      {log.resourceId || 'Não informado'}
                    </TableCell>

                    {/* IP */}

                    <TableCell
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 13,
                      }}
                    >
                      {log.ipAddress || 'Não informado'}
                    </TableCell>

                  </TableRow>
                );
              })}

              {/* NENHUM REGISTRO */}

              {!loading &&
                !error &&
                rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography
                        color="text.secondary"
                        sx={{
                          py: 3,
                          textAlign: 'center',
                        }}
                      >
                        {invalidRange
                          ? 'Verifique o intervalo de datas informado.'
                          : 'Nenhum registro encontrado para os filtros selecionados.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

            </TableBody>

          </Table>
        </TableContainer>

        {/* PAGINAÇÃO */}

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />

      </Paper>

      {/* MODAL DE DIFERENÇAS */}

      <AuditDiffModal
        open={!!selected}
        log={selected}
        onClose={() => setSelected(null)}
      />

    </>
  );
}
