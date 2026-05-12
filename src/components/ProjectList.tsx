import { useMemo } from 'react';
import { differenceInCalendarDays, formatDistanceToNow, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { EyeOff, MonitorDot, TerminalSquare } from 'lucide-react';
import { useStore, getProjectStatus, getDisplayName, selectVisibleProjects } from '../store';
import type { ScannedProject, ProjectStatus, OverridesFile } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

const STATUS_RANK: Record<ProjectStatus, number> = {
  active: 0,
  idea: 1,
  paused: 2,
  done: 3,
  abandoned: 4,
};

const PRIORITY_RANK: Record<string, number> = { A: 0, B: 1, C: 2 };

const STATUS_STRIPE: Record<ProjectStatus, string> = {
  active: 'border-l-emerald-400/80',
  paused: 'border-l-amber-400/80',
  abandoned: 'border-l-zinc-500/60',
  done: 'border-l-sky-400/80',
  idea: 'border-l-violet-400/80',
};

function bucketKey(iso: string): string {
  const days = differenceInCalendarDays(new Date(), parseISO(iso));
  if (days <= 0) return '今日';
  if (days === 1) return '昨日';
  if (days < 7) return '今週';
  if (days < 30) return '今月';
  if (days < 90) return '3ヶ月以内';
  return 'それ以前';
}

const BUCKET_ORDER = ['今日', '昨日', '今週', '今月', '3ヶ月以内', 'それ以前'];

export function ProjectList() {
  const index = useStore((s) => s.index);
  const overrides = useStore((s) => s.overrides);
  const search = useStore((s) => s.search);
  const statusFilter = useStore((s) => s.statusFilter);
  const priorityFilter = useStore((s) => s.priorityFilter);
  const sourceFilter = useStore((s) => s.sourceFilter);
  const entrypointFilter = useStore((s) => s.entrypointFilter);
  const showHidden = useStore((s) => s.showHidden);
  const sortMode = useStore((s) => s.sortMode);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const checkedIds = useStore((s) => s.checkedIds);
  const toggleChecked = useStore((s) => s.toggleChecked);
  const setCheckedMany = useStore((s) => s.setCheckedMany);

  const filtered = useMemo(() => {
    if (!index) return [] as ScannedProject[];
    let arr = selectVisibleProjects({
      index,
      overrides,
      search,
      statusFilter,
      priorityFilter,
      sourceFilter,
      entrypointFilter,
      showHidden,
    });
    if (sortMode === 'last_active') {
      arr = arr.sort((a, b) => (a.last_active < b.last_active ? 1 : -1));
    } else if (sortMode === 'name') {
      arr = arr.sort((a, b) =>
        getDisplayName(a, overrides).localeCompare(getDisplayName(b, overrides), 'ja'),
      );
    } else if (sortMode === 'priority') {
      arr = arr.sort((a, b) => {
        const ra = PRIORITY_RANK[overrides[a.id]?.priority ?? ''] ?? 99;
        const rb = PRIORITY_RANK[overrides[b.id]?.priority ?? ''] ?? 99;
        if (ra !== rb) return ra - rb;
        return a.last_active < b.last_active ? 1 : -1;
      });
    } else {
      arr = arr.sort((a, b) => {
        const ra = STATUS_RANK[getProjectStatus(a, overrides)];
        const rb = STATUS_RANK[getProjectStatus(b, overrides)];
        if (ra !== rb) return ra - rb;
        return a.last_active < b.last_active ? 1 : -1;
      });
    }
    return arr;
  }, [
    index,
    overrides,
    search,
    statusFilter,
    priorityFilter,
    sourceFilter,
    entrypointFilter,
    showHidden,
    sortMode,
  ]);

  const grouped = useMemo(() => {
    if (sortMode !== 'last_active') return null;
    const m = new Map<string, ScannedProject[]>();
    for (const p of filtered) {
      const k = bucketKey(p.last_active);
      const cur = m.get(k) ?? [];
      cur.push(p);
      m.set(k, cur);
    }
    return BUCKET_ORDER.filter((k) => m.has(k)).map((k) => [k, m.get(k)!] as const);
  }, [filtered, sortMode]);

  if (!index) return null;

  const visibleIds = filtered.map((p) => p.id);
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => checkedIds.has(id));
  const someChecked = visibleIds.some((id) => checkedIds.has(id));

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 bg-canvas/90 backdrop-blur border-b border-line px-4 py-2 flex items-center gap-3 text-xs">
        <label className="inline-flex items-center gap-2 text-fg-muted cursor-pointer">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = !allChecked && someChecked;
            }}
            onChange={(e) => setCheckedMany(visibleIds, e.target.checked)}
            className="accent-indigo-500"
          />
          表示中をすべて選択
        </label>
        <span className="text-fg-faint">·</span>
        <span className="text-fg-subtle">{filtered.length} 件表示中</span>
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-fg-subtle text-sm">
          <div className="text-3xl mb-2">🔍</div>
          該当するプロジェクトがありません
          <div className="text-xs text-fg-faint mt-2">フィルタを緩めるか、検索ワードを変えてみてください</div>
        </div>
      )}

      {grouped ? (
        <div>
          {grouped.map(([bucket, items]) => (
            <BucketSection key={bucket} title={bucket} count={items.length}>
              {items.map((p) => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  overrides={overrides}
                  selected={selectedId === p.id}
                  checked={checkedIds.has(p.id)}
                  onSelect={() => select(p.id)}
                  onCheck={() => toggleChecked(p.id)}
                />
              ))}
            </BucketSection>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((p) => (
            <ProjectRow
              key={p.id}
              project={p}
              overrides={overrides}
              selected={selectedId === p.id}
              checked={checkedIds.has(p.id)}
              onSelect={() => select(p.id)}
              onCheck={() => toggleChecked(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BucketSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="px-4 pt-4 pb-1 flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-fg-muted font-medium">
          {title}
        </span>
        <span className="text-[10px] text-fg-faint">{count}</span>
        <div className="flex-1 h-px bg-line ml-2" />
      </header>
      <div className="divide-y divide-line/60">{children}</div>
    </section>
  );
}

function ProjectRow({
  project,
  overrides,
  selected,
  checked,
  onSelect,
  onCheck,
}: {
  project: ScannedProject;
  overrides: OverridesFile;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onCheck: () => void;
}) {
  const ov = overrides[project.id];
  const status = getProjectStatus(project, overrides);
  const displayName = ov?.alias?.trim() || project.project_label || project.name;
  const nextAction = ov?.next_action_override?.trim();
  const statusLine =
    nextAction ||
    project.current_status ||
    project.last_assistant_message ||
    project.last_user_message ||
    '';

  return (
    <div
      onClick={onSelect}
      className={`group flex gap-3 px-4 py-3 cursor-pointer border-l-4 row-hover transition-colors ${
        STATUS_STRIPE[status]
      } ${selected ? 'bg-indigo-500/10' : ''}`}
    >
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="accent-indigo-500"
          aria-label="選択"
        />
      </div>

      <div className="pt-0.5 w-7 flex justify-center">
        <PriorityBadge priority={ov?.priority} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {ov?.hidden && <EyeOff size={13} className="text-fg-subtle mt-1" />}
          <h3 className="font-medium text-fg-strong leading-snug line-clamp-2 break-words">
            {displayName}
          </h3>
        </div>
        {statusLine && (
          <p className="text-xs text-fg-muted mt-1 leading-snug line-clamp-2">
            {statusLine}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-fg-subtle">
          <StatusBadge status={status} />
          <span className="font-mono truncate" title={project.path ?? ''}>
            [{project.name}]
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 w-28 pt-0.5 space-y-0.5">
        <div className="text-xs text-fg-muted">
          {formatDistanceToNow(parseISO(project.last_active), { addSuffix: true, locale: ja })}
        </div>
        <div className="text-[10px] text-fg-subtle inline-flex items-center gap-1 justify-end">
          {project.entrypoint === 'desktop' ? (
            <MonitorDot size={11} />
          ) : project.entrypoint === 'cli' ? (
            <TerminalSquare size={11} />
          ) : null}
          {project.entrypoint === 'desktop' ? 'Desktop' : project.entrypoint === 'cli' ? 'CLI' : '—'}
        </div>
        <div className="text-[10px] text-fg-faint">{project.source}</div>
      </div>
    </div>
  );
}
