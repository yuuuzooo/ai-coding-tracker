import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { INDEX_FILE } from './paths.js';
import { scan } from './scanner.js';
import {
  readOverrides,
  upsertOverride,
  bulkUpsertOverrides,
  deleteOverride,
} from './overrides.js';

function isLocal(req: IncomingMessage): boolean {
  const addr = req.socket.remoteAddress ?? '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url ?? '';
  if (!url.startsWith('/api/')) return false;
  const method = req.method ?? 'GET';

  try {
    if (url === '/api/index' && method === 'GET') {
      if (!fs.existsSync(INDEX_FILE)) await scan();
      const raw = await fsp.readFile(INDEX_FILE, 'utf8');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(raw);
      return true;
    }

    if (url === '/api/overrides' && method === 'GET') {
      const all = await readOverrides();
      send(res, 200, all);
      return true;
    }

    if (url === '/api/rescan' && method === 'POST') {
      if (!isLocal(req)) {
        send(res, 403, { error: 'forbidden' });
        return true;
      }
      const file = await scan();
      send(res, 200, { generated_at: file.generated_at, count: file.projects.length });
      return true;
    }

    if (url === '/api/overrides/bulk' && method === 'POST') {
      if (!isLocal(req)) {
        send(res, 403, { error: 'forbidden' });
        return true;
      }
      const body = (await readJson(req)) as any;
      const updates = Array.isArray(body?.updates) ? body.updates : [];
      const result = await bulkUpsertOverrides(updates);
      const all = await readOverrides();
      send(res, 200, {
        ok: result.ok,
        failed: result.failed,
        overrides: Object.fromEntries(result.ok.map((id) => [id, all[id]])),
      });
      return true;
    }

    const m = url.match(/^\/api\/overrides\/([A-Za-z0-9_-]+)$/);
    if (m) {
      const id = m[1];
      if (!isLocal(req)) {
        send(res, 403, { error: 'forbidden' });
        return true;
      }
      if (method === 'PUT') {
        const body = await readJson(req);
        const result = await upsertOverride(id, body);
        if (!result) {
          send(res, 400, { error: 'invalid override payload' });
          return true;
        }
        send(res, 200, result);
        return true;
      }
      if (method === 'DELETE') {
        const ok = await deleteOverride(id);
        send(res, ok ? 200 : 404, { ok });
        return true;
      }
    }

    send(res, 404, { error: 'not found' });
    return true;
  } catch (err) {
    console.error('[api] error', err);
    send(res, 500, { error: (err as Error).message });
    return true;
  }
}
