import { useState } from 'react';
import { CheckCircle2, X, EyeOff, Eye } from 'lucide-react';
import { useStore } from '../store';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, type Priority, type ProjectStatus } from '../types';
import { statusLabel } from './StatusBadge';

export function BulkBar() {
  const checkedIds = useStore((s) => s.checkedIds);
  const bulkBusy = useStore((s) => s.bulkBusy);
  const clearChecked = useStore((s) => s.clearChecked);
  const bulkApply = useStore((s) => s.bulkApply);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus>('paused');
  const [pendingPriority, setPendingPriority] = useState<Priority | ''>('');

  if (checkedIds.size === 0) return null;

  return (
    <div className="bg-indigo-500/10 border-b border-indigo-500/30 px-4 py-2 flex items-center gap-3 flex-wrap text-sm">
      <div className="font-medium text-indigo-700 dark:text-indigo-200 inline-flex items-center gap-1.5">
        <CheckCircle2 size={14} /> {checkedIds.size} 件選択
      </div>

      <Sep />

      <span className="text-xs text-fg-muted">ステータス</span>
      <select
        value={pendingStatus}
        onChange={(e) => setPendingStatus(e.target.value as ProjectStatus)}
        className="bg-elev border border-line rounded px-2 py-1 text-xs"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>
      <button
        disabled={bulkBusy}
        onClick={() => bulkApply({ status: pendingStatus })}
        className="px-3 py-1 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium disabled:opacity-50"
      >
        {bulkBusy ? '適用中…' : '適用'}
      </button>

      <Sep />

      <span className="text-xs text-fg-muted">優先度</span>
      <select
        value={pendingPriority}
        onChange={(e) => setPendingPriority(e.target.value as Priority | '')}
        className="bg-elev border border-line rounded px-2 py-1 text-xs"
      >
        <option value="">— 選択 —</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button
        disabled={bulkBusy || !pendingPriority}
        onClick={() => pendingPriority && bulkApply({ priority: pendingPriority })}
        className="px-2.5 py-1 rounded-md border border-line hover:bg-elev text-xs disabled:opacity-50"
      >
        適用
      </button>
      <button
        disabled={bulkBusy}
        onClick={() => bulkApply({ clearPriority: true })}
        className="px-2.5 py-1 rounded-md border border-line hover:bg-elev text-xs disabled:opacity-50"
        title="優先度を未設定に戻す"
      >
        クリア
      </button>

      <Sep />

      <button
        disabled={bulkBusy}
        onClick={() => bulkApply({ hidden: true })}
        className="px-2.5 py-1 rounded-md border border-line hover:bg-elev text-xs inline-flex items-center gap-1 disabled:opacity-50"
      >
        <EyeOff size={12} /> 隠す
      </button>
      <button
        disabled={bulkBusy}
        onClick={() => bulkApply({ hidden: false })}
        className="px-2.5 py-1 rounded-md border border-line hover:bg-elev text-xs inline-flex items-center gap-1 disabled:opacity-50"
      >
        <Eye size={12} /> 戻す
      </button>

      <div className="flex-1" />

      <button
        onClick={clearChecked}
        className="px-2 py-1 rounded text-fg-muted hover:bg-elev hover:text-fg-strong text-xs inline-flex items-center gap-1"
      >
        <X size={12} /> 選択解除
      </button>
    </div>
  );
}

function Sep() {
  return <span className="text-fg-faint">|</span>;
}
