import type { ProjectStatus } from '../types';
import { useT } from '../i18n/useT';
import { STRINGS, type Strings } from '../i18n/strings';
import { useStore } from '../store';

const STYLES: Record<ProjectStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  paused: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  abandoned: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
  done: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  idea: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
};

function labelFor(t: Strings, s: ProjectStatus): string {
  switch (s) {
    case 'active':
      return t.statusActive;
    case 'paused':
      return t.statusPaused;
    case 'abandoned':
      return t.statusAbandoned;
    case 'done':
      return t.statusDone;
    case 'idea':
      return t.statusIdea;
  }
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const t = useT();
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${STYLES[status]}`}
    >
      {labelFor(t, status)}
    </span>
  );
}

export function useStatusLabel(): (s: ProjectStatus) => string {
  const t = useT();
  return (s) => labelFor(t, s);
}

// Non-hook variant for places where a hook can't be called.
export function statusLabelOf(status: ProjectStatus): string {
  const lang = useStore.getState().lang;
  return labelFor(STRINGS[lang], status);
}
