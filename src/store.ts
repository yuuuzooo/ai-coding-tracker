import { create } from 'zustand';
import type { IndexFile, Override, OverridesFile, ProjectStatus, ScannedProject } from './types';
import { fetchIndex, fetchOverrides, putOverride, rescan, bulkUpsertOverridesApi } from './api';

type StatusFilter = ProjectStatus | 'all';
type PriorityFilter = 'A' | 'B' | 'C' | 'none' | 'all';
type SortMode = 'last_active' | 'name' | 'status' | 'priority';

type State = {
  loading: boolean;
  error: string | null;
  index: IndexFile | null;
  overrides: OverridesFile;
  selectedId: string | null;
  checkedIds: Set<string>;
  bulkBusy: boolean;
  search: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  showHidden: boolean;
  sortMode: SortMode;
  sourceFilter: 'all' | 'claude-code' | 'codex';
  entrypointFilter: 'all' | 'cli' | 'desktop' | 'unknown';

  load: () => Promise<void>;
  triggerRescan: () => Promise<void>;
  select: (id: string | null) => void;
  setSearch: (s: string) => void;
  setStatusFilter: (s: StatusFilter) => void;
  setPriorityFilter: (s: PriorityFilter) => void;
  setShowHidden: (b: boolean) => void;
  setSortMode: (m: SortMode) => void;
  setSourceFilter: (s: 'all' | 'claude-code' | 'codex') => void;
  setEntrypointFilter: (s: 'all' | 'cli' | 'desktop' | 'unknown') => void;
  saveOverride: (id: string, body: Omit<Override, 'updated_at'>) => Promise<void>;
  toggleChecked: (id: string) => void;
  setCheckedMany: (ids: string[], on: boolean) => void;
  clearChecked: () => void;
  bulkApply: (
    patch: Partial<Pick<Override, 'status' | 'hidden' | 'priority'>> & { clearPriority?: boolean },
  ) => Promise<void>;
};

export const useStore = create<State>((set, get) => ({
  loading: false,
  error: null,
  index: null,
  overrides: {},
  selectedId: null,
  checkedIds: new Set<string>(),
  bulkBusy: false,
  search: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  showHidden: false,
  sortMode: 'last_active',
  sourceFilter: 'all',
  entrypointFilter: 'all',

  async load() {
    set({ loading: true, error: null });
    try {
      const [index, overrides] = await Promise.all([fetchIndex(), fetchOverrides()]);
      set({ index, overrides, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async triggerRescan() {
    set({ loading: true, error: null });
    try {
      await rescan();
      const [index, overrides] = await Promise.all([fetchIndex(), fetchOverrides()]);
      set({ index, overrides, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  select: (id) => set({ selectedId: id }),
  setSearch: (s) => set({ search: s }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  setPriorityFilter: (s) => set({ priorityFilter: s }),
  setShowHidden: (b) => set({ showHidden: b }),
  setSortMode: (m) => set({ sortMode: m }),
  setSourceFilter: (s) => set({ sourceFilter: s }),
  setEntrypointFilter: (s) => set({ entrypointFilter: s }),

  async saveOverride(id, body) {
    const result = await putOverride(id, body);
    const next = { ...get().overrides, [id]: result };
    set({ overrides: next });
  },

  toggleChecked(id) {
    const next = new Set(get().checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ checkedIds: next });
  },

  setCheckedMany(ids, on) {
    const next = new Set(get().checkedIds);
    if (on) for (const id of ids) next.add(id);
    else for (const id of ids) next.delete(id);
    set({ checkedIds: next });
  },

  clearChecked() {
    set({ checkedIds: new Set<string>() });
  },

  async bulkApply(patch) {
    const ids = Array.from(get().checkedIds);
    if (ids.length === 0) return;
    set({ bulkBusy: true, error: null });
    try {
      const current = get().overrides;
      const updates = ids.map((id) => {
        const existing = current[id];
        const nextPriority = patch.clearPriority
          ? undefined
          : (patch.priority ?? existing?.priority);
        return {
          id,
          input: {
            status: patch.status ?? existing?.status ?? 'active',
            priority: nextPriority,
            next_action_override: existing?.next_action_override,
            note: existing?.note,
            hidden: patch.hidden ?? existing?.hidden,
            alias: existing?.alias,
          },
        };
      });
      const result = await bulkUpsertOverridesApi(updates);
      const nextOverrides = { ...get().overrides, ...result.overrides };
      const errMsg =
        result.failed.length > 0
          ? `${result.ok.length}件適用、${result.failed.length}件失敗`
          : null;
      set({ overrides: nextOverrides, bulkBusy: false, error: errMsg });
    } catch (e) {
      set({ error: (e as Error).message, bulkBusy: false });
    }
  },
}));

export function getProjectStatus(
  project: ScannedProject,
  overrides: OverridesFile,
): ProjectStatus {
  return overrides[project.id]?.status ?? 'active';
}

export function getDisplayName(project: ScannedProject, overrides: OverridesFile): string {
  const alias = overrides[project.id]?.alias?.trim();
  if (alias) return alias;
  if (project.project_label) return project.project_label;
  return project.name;
}

export function getSubName(project: ScannedProject, overrides: OverridesFile): string {
  return project.name;
}

export function getStatusLine(project: ScannedProject): string {
  return project.current_status || '';
}

export type VisibleProjectsInputs = Pick<
  State,
  | 'index'
  | 'overrides'
  | 'search'
  | 'statusFilter'
  | 'priorityFilter'
  | 'sourceFilter'
  | 'entrypointFilter'
  | 'showHidden'
>;

export function selectVisibleProjects(s: VisibleProjectsInputs): ScannedProject[] {
  if (!s.index) return [];
  const q = s.search.trim().toLowerCase();
  return s.index.projects.filter((p) => {
    const ov = s.overrides[p.id];
    if (!s.showHidden && ov?.hidden) return false;
    if (s.sourceFilter !== 'all' && p.source !== s.sourceFilter) return false;
    if (s.entrypointFilter !== 'all' && p.entrypoint !== s.entrypointFilter) return false;
    if (s.priorityFilter !== 'all') {
      const pri = ov?.priority;
      if (s.priorityFilter === 'none') {
        if (pri) return false;
      } else if (pri !== s.priorityFilter) return false;
    }
    const status = getProjectStatus(p, s.overrides);
    if (s.statusFilter === 'all') {
      if (status === 'abandoned') return false;
    } else if (status !== s.statusFilter) {
      return false;
    }
    if (q) {
      const display = getDisplayName(p, s.overrides);
      const hay = `${display} ${p.name} ${p.path ?? ''} ${p.topic} ${p.last_user_message} ${p.last_assistant_message} ${ov?.note ?? ''} ${ov?.next_action_override ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
