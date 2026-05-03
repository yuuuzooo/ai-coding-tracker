export type Source = 'claude-code' | 'codex';
export type Entrypoint = 'cli' | 'desktop' | 'unknown';

export type ScannedProject = {
  id: string;
  source: Source;
  entrypoint: Entrypoint;
  name: string;
  path: string | null;
  session_count: number;
  first_seen: string;
  last_active: string;
  last_user_message: string;
  last_assistant_message: string;
  last_session_id: string;
  total_messages: number;
  project_label: string;
  current_status: string;
  topic: string;
  auto_label: string;
};

export type IndexFile = { generated_at: string; projects: ScannedProject[] };

export type ProjectStatus = 'active' | 'paused' | 'abandoned' | 'done' | 'idea';
export type Priority = 'A' | 'B' | 'C';

export type Override = {
  status: ProjectStatus;
  priority?: Priority;
  next_action_override?: string;
  note?: string;
  hidden?: boolean;
  alias?: string;
  updated_at: string;
};

export type OverridesFile = Record<string, Override>;

export const STATUS_OPTIONS: ProjectStatus[] = ['active', 'paused', 'abandoned', 'done', 'idea'];
export const PRIORITY_OPTIONS: Priority[] = ['A', 'B', 'C'];
