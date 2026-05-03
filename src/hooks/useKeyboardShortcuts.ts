import { useEffect } from 'react';
import { useStore } from '../store';
import type { Priority, ProjectStatus } from '../types';

const STATUS_BY_KEY: Record<string, ProjectStatus> = {
  '1': 'active',
  '2': 'paused',
  '3': 'abandoned',
  '4': 'done',
  '5': 'idea',
};

const PRIORITY_BY_KEY: Record<string, Priority> = {
  a: 'A',
  b: 'B',
  c: 'C',
};

function isTextInput(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

function getVisibleProjects() {
  const s = useStore.getState();
  const { index, overrides, search, statusFilter, priorityFilter, sourceFilter, entrypointFilter, showHidden } = s;
  if (!index) return [];
  const q = search.trim().toLowerCase();
  return index.projects.filter((p) => {
    const ov = overrides[p.id];
    if (!showHidden && ov?.hidden) return false;
    if (sourceFilter !== 'all' && p.source !== sourceFilter) return false;
    if (entrypointFilter !== 'all' && p.entrypoint !== entrypointFilter) return false;
    if (priorityFilter !== 'all') {
      const pri = ov?.priority;
      if (priorityFilter === 'none') {
        if (pri) return false;
      } else if (pri !== priorityFilter) return false;
    }
    const status = ov?.status ?? 'active';
    if (statusFilter === 'all') {
      if (status === 'abandoned') return false;
    } else if (status !== statusFilter) {
      return false;
    }
    if (q) {
      const hay = `${p.name} ${p.path ?? ''} ${p.topic} ${p.last_user_message} ${p.last_assistant_message} ${ov?.note ?? ''} ${ov?.next_action_override ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const inText = isTextInput(e.target);

      // Allow Esc and Cmd/Ctrl combos even in inputs
      if (e.key === 'Escape') {
        const s = useStore.getState();
        if (inText && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
          e.preventDefault();
          return;
        }
        if (s.checkedIds.size > 0) {
          s.clearChecked();
          e.preventDefault();
          return;
        }
        if (s.selectedId) {
          s.select(null);
          e.preventDefault();
          return;
        }
        return;
      }

      if (inText) return;

      // / focus search
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const el = document.getElementById('pjx-search') as HTMLInputElement | null;
        if (el) {
          el.focus();
          el.select();
          e.preventDefault();
        }
        return;
      }

      const s = useStore.getState();
      const projects = getVisibleProjects();
      const currentIdx = s.selectedId ? projects.findIndex((p) => p.id === s.selectedId) : -1;

      // j / ArrowDown
      if (e.key === 'j' || e.key === 'ArrowDown') {
        if (projects.length === 0) return;
        const next = currentIdx < 0 ? 0 : Math.min(currentIdx + 1, projects.length - 1);
        s.select(projects[next].id);
        e.preventDefault();
        return;
      }
      // k / ArrowUp
      if (e.key === 'k' || e.key === 'ArrowUp') {
        if (projects.length === 0) return;
        const next = currentIdx < 0 ? 0 : Math.max(currentIdx - 1, 0);
        s.select(projects[next].id);
        e.preventDefault();
        return;
      }

      if (!s.selectedId) return;
      const ov = s.overrides[s.selectedId];

      // 1-5 status
      if (STATUS_BY_KEY[e.key]) {
        const newStatus = STATUS_BY_KEY[e.key];
        s.saveOverride(s.selectedId, {
          status: newStatus,
          priority: ov?.priority,
          next_action_override: ov?.next_action_override,
          note: ov?.note,
          hidden: ov?.hidden,
          alias: ov?.alias,
        });
        e.preventDefault();
        return;
      }
      // a/b/c priority
      if (PRIORITY_BY_KEY[e.key.toLowerCase()]) {
        const newPri = PRIORITY_BY_KEY[e.key.toLowerCase()];
        s.saveOverride(s.selectedId, {
          status: ov?.status ?? 'active',
          priority: newPri,
          next_action_override: ov?.next_action_override,
          note: ov?.note,
          hidden: ov?.hidden,
          alias: ov?.alias,
        });
        e.preventDefault();
        return;
      }
      // h hide
      if (e.key === 'h') {
        s.saveOverride(s.selectedId, {
          status: ov?.status ?? 'active',
          priority: ov?.priority,
          next_action_override: ov?.next_action_override,
          note: ov?.note,
          hidden: !(ov?.hidden ?? false),
          alias: ov?.alias,
        });
        e.preventDefault();
        return;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
