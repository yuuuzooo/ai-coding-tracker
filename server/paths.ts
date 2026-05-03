import os from 'node:os';
import path from 'node:path';

const HOME = os.homedir();

export const CLAUDE_PROJECTS_DIR = path.join(HOME, '.claude', 'projects');
export const CODEX_DIR = path.join(HOME, '.codex');
export const CODEX_SESSIONS_DIR = path.join(CODEX_DIR, 'sessions');
export const CODEX_SESSION_INDEX = path.join(CODEX_DIR, 'session_index.jsonl');
export const CODEX_HISTORY = path.join(CODEX_DIR, 'history.jsonl');

export const PJX_DIR = path.join(HOME, '.claude-pjx');
export const INDEX_FILE = path.join(PJX_DIR, 'index.json');
export const OVERRIDES_FILE = path.join(PJX_DIR, 'overrides.json');
