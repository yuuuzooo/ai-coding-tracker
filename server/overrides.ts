import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { OVERRIDES_FILE, PJX_DIR } from './paths.js';
import type { Override, OverridesFile, Priority, ProjectStatus } from './types.js';

const VALID_STATUS: ProjectStatus[] = ['active', 'paused', 'abandoned', 'done', 'idea'];
const VALID_PRIORITY: Priority[] = ['A', 'B', 'C'];

let writeChain: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeChain.then(fn, fn);
  writeChain = next.catch(() => undefined);
  return next;
}

export class OverridesCorruptError extends Error {
  constructor(
    message: string,
    public readonly backupPath: string | null,
  ) {
    super(message);
    this.name = 'OverridesCorruptError';
  }
}

async function quarantineCorruptFile(): Promise<string | null> {
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = path.join(PJX_DIR, `overrides.json.corrupt.${ts}`);
    await fsp.rename(OVERRIDES_FILE, backup);
    return backup;
  } catch (err) {
    console.error('[overrides] failed to quarantine corrupt file', err);
    return null;
  }
}

export async function readOverrides(): Promise<OverridesFile> {
  if (!fs.existsSync(OVERRIDES_FILE)) return {};
  const raw = await fsp.readFile(OVERRIDES_FILE, 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const backup = await quarantineCorruptFile();
    throw new OverridesCorruptError(
      `overrides.json is not valid JSON: ${(err as Error).message}`,
      backup,
    );
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    const backup = await quarantineCorruptFile();
    throw new OverridesCorruptError('overrides.json is not a JSON object', backup);
  }
  return parsed as OverridesFile;
}

async function writeOverrides(data: OverridesFile): Promise<void> {
  await fsp.mkdir(PJX_DIR, { recursive: true });
  const tmp = path.join(
    PJX_DIR,
    `overrides.json.tmp.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`,
  );
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fsp.rename(tmp, OVERRIDES_FILE);
}

function sanitize(input: unknown): Override | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  const status = o.status;
  if (typeof status !== 'string' || !VALID_STATUS.includes(status as ProjectStatus)) return null;
  const out: Override = {
    status: status as ProjectStatus,
    updated_at: new Date().toISOString(),
  };
  if (typeof o.priority === 'string' && VALID_PRIORITY.includes(o.priority as Priority)) {
    out.priority = o.priority as Priority;
  } else if (o.priority === null) {
    // explicit clear handled at caller
  }
  if (typeof o.next_action_override === 'string') out.next_action_override = o.next_action_override;
  if (typeof o.note === 'string') out.note = o.note;
  if (typeof o.hidden === 'boolean') out.hidden = o.hidden;
  if (typeof o.alias === 'string') out.alias = o.alias;
  return out;
}

export async function upsertOverride(id: string, input: unknown): Promise<Override | null> {
  const sanitized = sanitize(input);
  if (!sanitized) return null;
  return withWriteLock(async () => {
    const all = await readOverrides();
    all[id] = sanitized;
    await writeOverrides(all);
    return sanitized;
  });
}

export async function bulkUpsertOverrides(
  updates: Array<{ id: string; input: unknown }>,
): Promise<{ ok: string[]; failed: Array<{ id: string; reason: string }> }> {
  return withWriteLock(async () => {
    const all = await readOverrides();
    const ok: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];
    for (const { id, input } of updates) {
      const sanitized = sanitize(input);
      if (!sanitized) {
        failed.push({ id, reason: 'invalid payload' });
        continue;
      }
      all[id] = sanitized;
      ok.push(id);
    }
    await writeOverrides(all);
    return { ok, failed };
  });
}

export async function deleteOverride(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const all = await readOverrides();
    if (!(id in all)) return false;
    delete all[id];
    await writeOverrides(all);
    return true;
  });
}
