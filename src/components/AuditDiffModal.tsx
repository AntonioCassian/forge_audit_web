import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import type { AuditLog, JsonObject, JsonValue } from '../types';

type LineStatus = 'same' | 'changed' | 'added' | 'removed';
interface DiffLine {
  text: string;
  status: LineStatus;
}
type Side = 'old' | 'new';

const isContainer = (v: JsonValue): v is JsonValue[] | JsonObject => typeof v === 'object' && v !== null;

/** Achata o JSON em { "caminho.do.campo": "valor serializado" } para comparação campo a campo. */
function flatten(value: JsonValue, path = '', out: Record<string, string> = {}): Record<string, string> {
  if (isContainer(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) out[path] = Array.isArray(value) ? '[]' : '{}';
    keys.forEach((k) => flatten((value as Record<string, JsonValue>)[k], path ? `${path}.${k}` : k, out));
  } else {
    out[path] = JSON.stringify(value);
  }
  return out;
}

/** Gera as linhas indentadas de um lado, marcando cada campo (folha) conforme o outro lado. */
function buildLines(
  value: JsonValue,
  other: Record<string, string>,
  side: Side,
  path = '',
  indent = 0,
  label?: string,
  comma = false,
  lines: DiffLine[] = [],
): DiffLine[] {
  const pad = '  '.repeat(indent);
  const prefix = label !== undefined ? `"${label}": ` : '';
  const tail = comma ? ',' : '';

  if (isContainer(value) && Object.keys(value).length > 0) {
    const isArr = Array.isArray(value);
    const keys = Object.keys(value).sort((a, b) => (isArr ? Number(a) - Number(b) : a.localeCompare(b)));
    lines.push({ text: `${pad}${prefix}${isArr ? '[' : '{'}`, status: 'same' });
    keys.forEach((k, i) => {
      buildLines(
        (value as Record<string, JsonValue>)[k],
        other,
        side,
        path ? `${path}.${k}` : k,
        indent + 1,
        isArr ? undefined : k,
        i < keys.length - 1,
        lines,
      );
    });
    lines.push({ text: `${pad}${isArr ? ']' : '}'}${tail}`, status: 'same' });
    return lines;
  }

  const serialized = isContainer(value) ? (Array.isArray(value) ? '[]' : '{}') : JSON.stringify(value);
  const counterpart = other[path];
  let status: LineStatus = 'same';
  if (counterpart === undefined) status = side === 'old' ? 'removed' : 'added';
  else if (counterpart !== serialized) status = 'changed';

  lines.push({ text: `${pad}${prefix}${serialized}${tail}`, status });
  return lines;
}

const BG: Record<LineStatus, string> = {
  same: 'transparent',
  changed: 'rgba(245, 166, 35, 0.22)',
  added: 'rgba(46, 125, 50, 0.20)',
  removed: 'rgba(198, 40, 40, 0.18)',
};
const MARK: Record<LineStatus, string> = { same: ' ', changed: '~', added: '+', removed: '−' };

function JsonPane({ title, lines, empty }: { title: string; lines: DiffLine[] | null; empty: string }) {
  return (
    <div className="min-w-0 flex-1">
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <div
        className="overflow-x-auto rounded border"
        style={{ borderColor: '#D5DBE1', backgroundColor: '#F8F9FB', fontFamily: '"IBM Plex Mono", monospace', fontSize: 13 }}
      >
        {lines ? (
          lines.map((line, i) => (
            <div key={i} className="flex whitespace-pre px-2 py-px" style={{ backgroundColor: BG[line.status] }}>
              <span aria-hidden className="w-4 shrink-0 select-none opacity-60">
                {MARK[line.status]}
              </span>
              <span>{line.text}</span>
            </div>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {empty}
          </Typography>
        )}
      </div>
    </div>
  );
}

interface AuditDiffModalProps {
  open: boolean;
  log: AuditLog | null;
  onClose: () => void;
}

export default function AuditDiffModal({ open, log, onClose }: AuditDiffModalProps) {
  const diff = useMemo(() => {
    if (!log) return null;
    const oldFlat = log.oldValues ? flatten(log.oldValues) : {};
    const newFlat = log.newValues ? flatten(log.newValues) : {};
    const paths = new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)]);
    const changedCount = [...paths].filter((p) => oldFlat[p] !== newFlat[p]).length;
    return {
      oldLines: log.oldValues ? buildLines(log.oldValues, newFlat, 'old') : null,
      newLines: log.newValues ? buildLines(log.newValues, oldFlat, 'new') : null,
      changedCount,
    };
  }, [log]);

  if (!log || !diff) return null;

  const meta: Array<[string, string]> = [
    ['Responsável', `${log.user.name} (${log.user.email})`],
    ['Cargo', log.user.role],
    ['Endereço IP', log.ipAddress],
    ['Data e hora', new Date(log.createdAt).toLocaleString('pt-BR')],
    ['Recurso', `${log.resource} · ${log.resourceId}`],
    ['Ação', log.action],
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth aria-labelledby="audit-diff-title">
      <DialogTitle id="audit-diff-title" sx={{ pr: 7 }}>
        Detalhe do registro de auditoria
        <IconButton aria-label="Fechar" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <dl className="mb-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map(([term, desc]) => (
            <div key={term}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {term}
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500, wordBreak: 'break-word' }}>
                {desc}
              </Typography>
            </div>
          ))}
        </dl>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip
            size="small"
            label={`${diff.changedCount} ${diff.changedCount === 1 ? 'campo alterado' : 'campos alterados'}`}
            color={diff.changedCount ? 'warning' : 'default'}
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            + incluído · − removido · ~ valor alterado
          </Typography>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <JsonPane title="Antes" lines={diff.oldLines} empty="Sem valores anteriores (registro criado nesta ação)." />
          <JsonPane title="Depois" lines={diff.newLines} empty="Sem valores posteriores (registro removido nesta ação)." />
        </div>
      </DialogContent>
    </Dialog>
  );
}
