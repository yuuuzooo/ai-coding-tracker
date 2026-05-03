import type { Priority } from '../types';

const STYLES: Record<Priority, string> = {
  A: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40',
  B: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  C: 'bg-slate-500/15 text-fg border-slate-500/30',
};

export function PriorityBadge({ priority }: { priority: Priority | undefined }) {
  if (!priority) {
    return <span className="text-fg-faint text-xs">—</span>;
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded border ${STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
