import os from 'node:os';
import path from 'node:path';

const HOME = os.homedir();

function envPath(name: string, fallback: string): string {
  const v = process.env[name];
  if (v && v.trim()) return path.isAbsolute(v) ? v : path.resolve(v);
  return fallback;
}

// Source directories (read-only). Override via environment variables when
// Claude Code / Codex CLI store their history outside the default $HOME location
// (e.g. WSL users pointing at the Windows-side .claude directory).
export const CLAUDE_PROJECTS_DIR = envPath(
  'AICT_CLAUDE_PROJECTS_DIR',
  path.join(HOME, '.claude', 'projects'),
);
export const CODEX_DIR = envPath('AICT_CODEX_DIR', path.join(HOME, '.codex'));
export const CODEX_SESSIONS_DIR = envPath(
  'AICT_CODEX_SESSIONS_DIR',
  path.join(CODEX_DIR, 'sessions'),
);
export const CODEX_SESSION_INDEX = path.join(CODEX_DIR, 'session_index.jsonl');
export const CODEX_HISTORY = path.join(CODEX_DIR, 'history.jsonl');

// Writable runtime data directory. Override via AICT_DATA_DIR if you want to
// keep state somewhere other than ~/.ai-coding-tracker (e.g. a cloud-synced folder).
export const PJX_DIR = envPath('AICT_DATA_DIR', path.join(HOME, '.ai-coding-tracker'));
export const INDEX_FILE = path.join(PJX_DIR, 'index.json');
export const OVERRIDES_FILE = path.join(PJX_DIR, 'overrides.json');
