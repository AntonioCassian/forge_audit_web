
import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import Can from '../components/Can';
import OrderFormModal from '../components/OrderFormModal';
import OrderQuantityDialog from '../components/OrderQuantityDialog';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

import { getErrorMessage } from '../services/api';
import { machineService } from '../services/machineService';
import { productionOrderService } from '../services/productionOrderService';

import type {
  CreateProductionOrderDTO,
  Machine,
  OrderStatus,
  ProductionOrder,
} from '../types';

// ========================================
// HELPERS
// ========================================

const percent = (o: ProductionOrder): number =>
  o.plannedQuantity > 0
    ? Math.min(
        100,
        Math.round(
          (o.producedQuantity / o.plannedQuantity) * 100
        )
      )
    : 0;

/**
 * Cor da barra de progresso conforme o status.
 */
const progressColor = (
  status: OrderStatus
): 'success' | 'warning' | 'primary' =>
  status === 'COMPLETED'
    ? 'success'
    : status === 'SUSPENDED'
      ? 'warning'
      : 'primary';

// ========================================
// ROW ACTIONS
// ========================================

interface RowActionsProps {
  order: ProductionOrder;
  busy: boolean;

  onStatus: (
    order: ProductionOrder,
    status: OrderStatus,
    message: string
  ) => void;

  onQuantity: (order: ProductionOrder) => void;
}

function RowActions({
  order,
  busy,
  onStatus,
  onQuantity,
}: RowActionsProps) {

  const { status, machineId } = order;

  const canStart =
    status === 'PLANNED' || status === 'SUSPENDED';

  const canSuspend = status === 'IN_PROGRESS';

  const canComplete = status === 'IN_PROGRESS';

  const canUpdateQty =
    status === 'IN_PROGRESS' || status === 'SUSPENDED';

  if (status === 'COMPLETED') {
    return (
      <Typography variant="body2" color="text.secondary">
        Ordem encerrada
      </Typography>
    );
  }

  const handleStatus = (
    newStatus: OrderStatus,
    message: string
  ) => {
    if (!machineId) {
      console.error(
        'Máquina não vinculada à ordem:',
        order
      );
      return;
    }

    onStatus(order, newStatus, message);
  };

  const handleQuantity = () => {
    if (!machineId) {
      console.error(
        'Máquina não vinculada à ordem:',
        order
      );
      return;
    }

    onQuantity(order);
  };

  return (
    <div className="flex flex-wrap gap-2">

      {canStart && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          disabled={busy || !machineId}
          onClick={() =>
            handleStatus(
              'IN_PROGRESS',
              `Lote ${order.productionCode} ${
                status === 'PLANNED'
                  ? 'iniciado'
                  : 'retomado'
              }.`
            )
          }
        >
          {status === 'PLANNED'
            ? 'Iniciar'
            : 'Retomar'}
        </Button>
      )}

      {canSuspend && (
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<PauseIcon />}
          disabled={busy || !machineId}
          onClick={() =>
            handleStatus(
              'SUSPENDED',
              `Lote ${order.productionCode} suspenso.`
            )
          }
        >
          Suspender
        </Button>
      )}

      {/* {canUpdateQty && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditNoteIcon />}
          disabled={busy || !machineId}
          onClick={handleQuantity}
        >
          Atualizar quantidade
        </Button>
      )} */}

      {canComplete && (
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<CheckCircleOutlineIcon />}
          disabled={busy || !machineId}
          onClick={() =>
            handleStatus(
              'COMPLETED',
              `Lote ${order.productionCode} concluído.`
            )
          }
        >
          Concluir
        </Button>
      )}

    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function ProductionOrdersPage() {

  const { can } = useAuth();

  const canCreate = can('orders:create');
  const canOperate = can('orders:operate');

  const { notify, toast } = useToast();

  // ========================================
  // STATES
  // ========================================

  const [orders, setOrders] = useState<ProductionOrder[]>([]);

  const [machines, setMachines] = useState<Machine[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [quantityOrder, setQuantityOrder] =
    useState<ProductionOrder | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);

  // ========================================
  // LOAD ORDERS
  // ========================================

  const load = useCallback(async () => {

    setLoading(true);
    setLoadError(null);

    try {

      const [orderList, machineList] = await Promise.all([

        productionOrderService.list(),

        canCreate
          ? machineService.list()
          : Promise.resolve<Machine[]>([]),

      ]);

      setOrders(orderList);
      setMachines(machineList);

    } catch (err) {

      setLoadError(
        getErrorMessage(
          err,
          'Não foi possível carregar as ordens de produção.'
        )
      );

    } finally {

      setLoading(false);

    }

  }, [canCreate]);

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    void load();
  }, [load]);

  // ========================================
  // REPLACE ORDER
  // ========================================

  const replaceOrder = (updated: ProductionOrder) => {

    setOrders((prev) =>
      prev.map((order) =>
        order.id === updated.id
          ? { ...order, ...updated }
          : order
      )
    );

  };

  // ========================================
  // CREATE ORDER
  // ========================================

  const handleCreate = async (
    dto: CreateProductionOrderDTO
  ) => {

    try {

      await productionOrderService.create(dto);

      setCreateOpen(false);

      await load();

      notify(`Ordem ${dto.productionCode} criada.`);

    } catch (err) {

      notify(
        getErrorMessage(
          err,
          'Não foi possível criar a ordem.'
        ),
        'error'
      );

    }

  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatus = async (
    order: ProductionOrder,
    status: OrderStatus,
    message: string
  ) => {

    if (busyId) return;

    setBusyId(order.id);

    try {

      // Atualiza o status no Backend.
      await productionOrderService.updateStatus(
        order.id,
        status
      );

      // Busca novamente os dados atualizados.
      await load();

      notify(message);

    } catch (err) {

      notify(
        getErrorMessage(
          err,
          'Não foi possível atualizar o status da ordem.'
        ),
        'error'
      );

    } finally {

      setBusyId(null);

    }

  };

  // ========================================
  // UPDATE PRODUCED QUANTITY
  // ========================================

  const handleQuantity = async (
    order: ProductionOrder,
    producedQuantity: number
  ) => {

    try {

      await productionOrderService.updateProducedQuantity(
        order.id,
        producedQuantity
      );

      setQuantityOrder(null);

      // Atualiza a tabela automaticamente.
      await load();

      notify(
        `Quantidade do lote ${order.productionCode} atualizada.`
      );

    } catch (err) {

      notify(
        getErrorMessage(
          err,
          'Não foi possível atualizar a quantidade produzida.'
        ),
        'error'
      );

    }

  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <>

      <PageHeader
        title="Ordens de produção"
        description="Lotes planejados, em produção e concluídos."
        action={
          <Can permission="orders:create">

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
            >
              Nova Ordem
            </Button>

          </Can>
        }
      />

      {/* LOAD ERROR */}

      {loadError && (

        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void load()}
            >
              Tentar novamente
            </Button>
          }
        >
          {loadError}
        </Alert>

      )}

      {/* ORDERS TABLE */}

      <Paper>

        {loading && <LinearProgress />}

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>Lote</TableCell>

                <TableCell>Máquina</TableCell>

                <TableCell sx={{ minWidth: 200 }}>
                  Progresso
                </TableCell>

                <TableCell>Status</TableCell>

                {canOperate && (
                  <TableCell>Ações</TableCell>
                )}

              </TableRow>

            </TableHead>

            <TableBody>

              {orders.map((o) => (

                <TableRow
                  key={o.id}
                  hover
                >

                  {/* PRODUCTION CODE */}

                  <TableCell
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontWeight: 500,
                    }}
                  >
                    {o.productionCode}
                  </TableCell>

                  {/* MACHINE */}

                  <TableCell>
                    {o.machineName || 'Não informada'}
                  </TableCell>

                  {/* PROGRESS */}

                  <TableCell>

                    <div className="flex flex-col gap-1">

                      <div
                        role="progressbar"
                        aria-valuenow={percent(o)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progresso do lote ${o.productionCode}`}
                      >

                        <LinearProgress
                          variant="determinate"
                          value={percent(o)}
                          color={progressColor(o.status)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                          }}
                        />

                      </div>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {o.producedQuantity} / {o.plannedQuantity} (
                        {percent(o)}%)
                      </Typography>

                    </div>

                  </TableCell>

                  {/* STATUS */}

                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>

                  {/* ACTIONS */}

                  {canOperate && (

                    <TableCell>

                      <RowActions
                        order={o}
                        busy={busyId === o.id}
                        onStatus={handleStatus}
                        onQuantity={setQuantityOrder}
                      />

                    </TableCell>

                  )}

                </TableRow>

              ))}

              {/* EMPTY STATE */}

              {!loading &&
                !loadError &&
                orders.length === 0 && (

                  <TableRow>

                    <TableCell
                      colSpan={canOperate ? 5 : 4}
                    >

                      <Typography
                        color="text.secondary"
                        sx={{
                          py: 3,
                          textAlign: 'center',
                        }}
                      >
                        Nenhuma ordem de produção encontrada.
                      </Typography>

                    </TableCell>

                  </TableRow>

                )}

            </TableBody>

          </Table>

        </TableContainer>

      </Paper>

      {/* CREATE ORDER MODAL */}

      <Can permission="orders:create">

        <OrderFormModal
          open={createOpen}
          machines={machines}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />

      </Can>

      {/* UPDATE QUANTITY MODAL */}

      <Can permission="orders:operate">

        <OrderQuantityDialog
          order={quantityOrder}
          onClose={() => setQuantityOrder(null)}
          onSubmit={handleQuantity}
        />

      </Can>

      {/* TOAST */}

      {toast}

    </>
  );
}
