import type { ProjectStatus } from '../types';

const STYLES: Record<ProjectStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  paused: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  abandoned: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
  done: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  idea: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
};

const LABELS: Record<ProjectStatus, string> = {
  active: '進行中',
  paused: '保留',
  abandoned: '不要',
  done: '完了',
  idea: 'アイデア',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

export function statusLabel(s: ProjectStatus): string {
  return LABELS[s];
}
