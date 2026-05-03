import type { IndexFile, Override, OverridesFile } from './types';

export async function fetchIndex(): Promise<IndexFile> {
  const r = await fetch('/api/index');
  if (!r.ok) throw new Error(`/api/index ${r.status}`);
  return r.json();
}

export async function fetchOverrides(): Promise<OverridesFile> {
  const r = await fetch('/api/overrides');
  if (!r.ok) throw new Error(`/api/overrides ${r.status}`);
  return r.json();
}

export async function putOverride(id: string, body: Omit<Override, 'updated_at'>): Promise<Override> {
  const r = await fetch(`/api/overrides/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT /api/overrides/${id} ${r.status}`);
  return r.json();
}

export async function deleteOverride(id: string): Promise<void> {
  const r = await fetch(`/api/overrides/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(`DELETE /api/overrides/${id} ${r.status}`);
}

export async function rescan(): Promise<{ generated_at: string; count: number }> {
  const r = await fetch('/api/rescan', { method: 'POST' });
  if (!r.ok) throw new Error(`/api/rescan ${r.status}`);
  return r.json();
}

export async function bulkUpsertOverridesApi(
  updates: Array<{ id: string; input: Omit<Override, 'updated_at'> }>,
): Promise<{
  ok: string[];
  failed: Array<{ id: string; reason: string }>;
  overrides: Record<string, Override>;
}> {
  const r = await fetch('/api/overrides/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!r.ok) throw new Error(`/api/overrides/bulk ${r.status}`);
  return r.json();
}
