import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Search, RefreshCw, Sparkles, Moon, Sun } from 'lucide-react';
import { useStore } from '../store';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, type ProjectStatus } from '../types';
import { statusLabel } from './StatusBadge';
import { useTheme } from '../hooks/useTheme';

const STATUS_DOT: Record<ProjectStatus, string> = {
  active: 'bg-emerald-400',
  paused: 'bg-amber-400',
  abandoned: 'bg-zinc-500',
  done: 'bg-sky-400',
  idea: 'bg-violet-400',
};

export function Sidebar() {
  const index = useStore((s) => s.index);
  const overrides = useStore((s) => s.overrides);
  const loading = useStore((s) => s.loading);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const statusFilter = useStore((s) => s.statusFilter);
  const setStatusFilter = useStore((s) => s.setStatusFilter);
  const sourceFilter = useStore((s) => s.sourceFilter);
  const setSourceFilter = useStore((s) => s.setSourceFilter);
  const entrypointFilter = useStore((s) => s.entrypointFilter);
  const setEntrypointFilter = useStore((s) => s.setEntrypointFilter);
  const priorityFilter = useStore((s) => s.priorityFilter);
  const setPriorityFilter = useStore((s) => s.setPriorityFilter);
  const sortMode = useStore((s) => s.sortMode);
  const setSortMode = useStore((s) => s.setSortMode);
  const showHidden = useStore((s) => s.showHidden);
  const setShowHidden = useStore((s) => s.setShowHidden);
  const triggerRescan = useStore((s) => s.triggerRescan);
  const { theme, toggle: toggleTheme } = useTheme();

  const counts = useMemo(() => {
    const out = {
      total: 0,
      visible: 0,
      byStatus: { active: 0, paused: 0, abandoned: 0, done: 0, idea: 0 } as Record<ProjectStatus, number>,
      byPriority: { A: 0, B: 0, C: 0, none: 0 },
      bySource: { 'claude-code': 0, codex: 0 },
      byEntrypoint: { cli: 0, desktop: 0, unknown: 0 },
      hidden: 0,
    };
    if (!index) return out;
    for (const p of index.projects) {
      out.total++;
      const ov = overrides[p.id];
      if (ov?.hidden) out.hidden++;
      if (!showHidden && ov?.hidden) continue;
      const st = (ov?.status ?? 'active') as ProjectStatus;
      out.byStatus[st]++;
      // Default-visible set excludes "不要" — abandoned items only appear when explicitly filtered to.
      if (st === 'abandoned') continue;
      out.visible++;
      const pr = ov?.priority;
      if (pr) out.byPriority[pr]++;
      else out.byPriority.none++;
      out.bySource[p.source]++;
      out.byEntrypoint[p.entrypoint]++;
    }
    return out;
  }, [index, overrides, showHidden]);

  return (
    <aside className="w-72 shrink-0 bg-surface border-r border-line flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center gap-1.5">
        <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" />
        <div className="font-semibold tracking-tight text-fg-strong">claude-pjx</div>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            className="p-1.5 rounded text-fg-muted hover:bg-elev hover:text-fg-strong"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={() => triggerRescan()}
            disabled={loading}
            title="再スキャン"
            className="p-1.5 rounded text-fg-muted hover:bg-elev hover:text-fg-strong disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-line">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            id="pjx-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索 (押下 /)"
            className="w-full bg-elev border border-line rounded-md pl-8 pr-2 py-1.5 text-sm placeholder:text-fg-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-sm">
        <Group title="ステータス">
          <Pill
            label="すべて"
            count={counts.visible}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          {STATUS_OPTIONS.map((s) => (
            <Pill
              key={s}
              label={statusLabel(s)}
              count={counts.byStatus[s]}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              dotClass={STATUS_DOT[s]}
            />
          ))}
        </Group>

        <Group title="優先度">
          <Pill
            label="すべて"
            count={counts.visible}
            active={priorityFilter === 'all'}
            onClick={() => setPriorityFilter('all')}
            compact
          />
          {PRIORITY_OPTIONS.map((p) => (
            <Pill
              key={p}
              label={p}
              count={counts.byPriority[p]}
              active={priorityFilter === p}
              onClick={() => setPriorityFilter(p)}
              compact
            />
          ))}
          <Pill
            label="未設定"
            count={counts.byPriority.none}
            active={priorityFilter === 'none'}
            onClick={() => setPriorityFilter('none')}
            compact
          />
        </Group>

        <Group title="ソース">
          <Pill
            label="すべて"
            count={counts.visible}
            active={sourceFilter === 'all'}
            onClick={() => setSourceFilter('all')}
            compact
          />
          <Pill
            label="claude-code"
            count={counts.bySource['claude-code']}
            active={sourceFilter === 'claude-code'}
            onClick={() => setSourceFilter('claude-code')}
            compact
          />
          <Pill
            label="codex"
            count={counts.bySource['codex']}
            active={sourceFilter === 'codex'}
            onClick={() => setSourceFilter('codex')}
            compact
          />
        </Group>

        <Group title="起動方法">
          <Pill
            label="すべて"
            count={counts.visible}
            active={entrypointFilter === 'all'}
            onClick={() => setEntrypointFilter('all')}
            compact
          />
          <Pill
            label="CLI"
            count={counts.byEntrypoint.cli}
            active={entrypointFilter === 'cli'}
            onClick={() => setEntrypointFilter('cli')}
            compact
          />
          <Pill
            label="Desktop"
            count={counts.byEntrypoint.desktop}
            active={entrypointFilter === 'desktop'}
            onClick={() => setEntrypointFilter('desktop')}
            compact
          />
          <div className="text-[10px] text-fg-faint mt-1 leading-relaxed">
            ※ ブラウザ版（claude.ai/code）はローカルに履歴が保存されないため検知不可
          </div>
        </Group>

        <Group title="並び順">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="w-full bg-elev border border-line rounded-md px-2 py-1.5 text-sm"
          >
            <option value="last_active">最終活動順</option>
            <option value="priority">優先度順</option>
            <option value="status">ステータス順</option>
            <option value="name">名前順</option>
          </select>
        </Group>

        <Group title="表示">
          <label className="flex items-center gap-2 text-sm text-fg cursor-pointer">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="accent-indigo-500"
            />
            非表示も表示 ({counts.hidden})
          </label>
        </Group>
      </div>

      <div className="px-4 py-2 border-t border-line text-[11px] text-fg-subtle flex items-center justify-between">
        <span>{counts.visible} / {counts.total} 件</span>
        {index && (
          <span className="font-mono" title={index.generated_at}>
            {format(parseISO(index.generated_at), 'MM-dd HH:mm')}
          </span>
        )}
      </div>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-1.5 px-1">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  label,
  count,
  active,
  onClick,
  dotClass,
  compact,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dotClass?: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 ${
        compact ? 'px-2 py-0.5' : 'px-2.5 py-1 w-full justify-between'
      } text-xs rounded-md border transition-colors ${
        active
          ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-700 dark:text-indigo-200'
          : 'bg-elev border-line text-fg hover:border-line'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {dotClass && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
        {label}
      </span>
      <span className={`text-[10px] ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-fg-subtle'}`}>
        {count}
      </span>
    </button>
  );
}
