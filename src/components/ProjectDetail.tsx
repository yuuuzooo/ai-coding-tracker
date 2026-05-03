import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, ExternalLink, Folder, MessageSquare, Pencil, Play, X } from 'lucide-react';
import { useStore, getDisplayName } from '../store';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, type Priority, type ProjectStatus } from '../types';
import { statusLabel, StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CopyableCommand } from './CopyableCommand';

export function ProjectDetail() {
  const selectedId = useStore((s) => s.selectedId);
  const index = useStore((s) => s.index);
  const overrides = useStore((s) => s.overrides);
  const select = useStore((s) => s.select);
  const saveOverride = useStore((s) => s.saveOverride);

  const project = index?.projects.find((p) => p.id === selectedId) ?? null;
  const ov = project ? overrides[project.id] : undefined;

  const [status, setStatus] = useState<ProjectStatus>('active');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [nextAction, setNextAction] = useState('');
  const [note, setNote] = useState('');
  const [hidden, setHidden] = useState(false);
  const [alias, setAlias] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    if (!project) return;
    setStatus(ov?.status ?? 'active');
    setPriority(ov?.priority ?? '');
    setNextAction(ov?.next_action_override ?? '');
    setNote(ov?.note ?? '');
    setHidden(ov?.hidden ?? false);
    setAlias(ov?.alias ?? '');
    setEditingTitle(false);
  }, [project?.id, ov?.updated_at]);

  if (!project) return null;

  async function save(
    next: Partial<{
      status: ProjectStatus;
      priority: Priority | '';
      next_action_override: string;
      note: string;
      hidden: boolean;
      alias: string;
    }>,
  ) {
    if (!project) return;
    const nextPriority = next.priority !== undefined ? next.priority : priority;
    const body = {
      status: next.status ?? status,
      priority: nextPriority || undefined,
      next_action_override: (next.next_action_override ?? nextAction) || undefined,
      note: (next.note ?? note) || undefined,
      hidden: next.hidden ?? hidden,
      alias: (next.alias ?? alias) || undefined,
    };
    await saveOverride(project.id, body);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
  }

  const resumeCommand =
    project.source === 'codex' && project.last_session_id
      ? `codex resume ${project.last_session_id}`
      : project.path
        ? `cd "${project.path}" && claude --resume ${project.last_session_id ?? ''}`.trim()
        : null;

  return (
    <div className="w-[540px] shrink-0 border-l border-line flex flex-col h-full overflow-hidden bg-surface">
      {/* Sticky header */}
      <header className="px-5 pt-4 pb-3 border-b border-line bg-surface/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-fg-subtle">
              <span>{project.source}</span>
              <span>·</span>
              <span>
                {project.entrypoint === 'desktop'
                  ? 'Desktop'
                  : project.entrypoint === 'cli'
                    ? 'CLI'
                    : '—'}
              </span>
              <span>·</span>
              <span className="font-mono">[{project.name}]</span>
            </div>
            {editingTitle ? (
              <input
                autoFocus
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                onBlur={() => {
                  save({ alias });
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    save({ alias });
                    setEditingTitle(false);
                  } else if (e.key === 'Escape') {
                    setAlias(ov?.alias ?? '');
                    setEditingTitle(false);
                  }
                }}
                placeholder={project.project_label || project.name}
                className="w-full bg-elev border border-indigo-500/40 rounded px-2 py-1 text-[17px] font-semibold mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
              />
            ) : (
              <div className="group inline-flex items-start gap-1.5 mt-1">
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-[17px] font-semibold leading-snug cursor-text"
                  title="クリックで編集"
                >
                  {getDisplayName(project, overrides)}
                </h2>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 mt-1 rounded text-fg-subtle hover:text-fg-strong"
                  title="表示名を編集"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => select(null)}
            className="p-1 rounded text-fg-subtle hover:bg-elev hover:text-fg-strong"
            aria-label="閉じる"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <StatusBadge status={status} />
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value as ProjectStatus;
              setStatus(v);
              save({ status: v });
            }}
            className="bg-elev border border-line rounded px-2 py-0.5 text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <span className="text-fg-faint">|</span>
          <PriorityBadge priority={priority || undefined} />
          <select
            value={priority}
            onChange={(e) => {
              const v = e.target.value as Priority | '';
              setPriority(v);
              save({ priority: v });
            }}
            className="bg-elev border border-line rounded px-2 py-0.5 text-xs"
          >
            <option value="">優先度なし</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                優先度 {p}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          {savedFlash && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 animate-toast-in">
              <Check size={12} /> 保存
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Resume command — promoted to top */}
        <section className="bg-indigo-500/5 border border-indigo-500/30 rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-200 inline-flex items-center gap-1.5">
            <Play size={12} /> 続きから再開
          </div>
          {resumeCommand ? (
            <CopyableCommand command={resumeCommand} />
          ) : (
            <div className="text-xs text-fg-subtle">起動方法を判定できませんでした</div>
          )}
          {project.entrypoint === 'desktop' && (
            <div className="text-[11px] text-fg-subtle">
              ※ Claude Desktop アプリのチャット履歴からも再開できます
            </div>
          )}
          {project.source === 'codex' && (
            <div className="text-[11px] text-fg-subtle">
              ※ <span className="font-mono">codex resume</span> 単体で対話的にセッション選択も可
            </div>
          )}
        </section>

        {/* Path / quick actions */}
        {project.path && (
          <section className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle">作業ディレクトリ</div>
            <div className="flex items-center gap-2">
              <Folder size={13} className="text-fg-subtle" />
              <span className="font-mono text-xs text-fg truncate flex-1" title={project.path}>
                {project.path}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(project.path!)}
                className="text-[11px] px-2 py-0.5 rounded border border-line hover:bg-elev text-fg-muted"
              >
                Copy
              </button>
              <button
                onClick={() => window.open(`vscode://file${project.path}`)}
                className="text-[11px] px-2 py-0.5 rounded border border-line hover:bg-elev text-fg-muted inline-flex items-center gap-1"
              >
                <ExternalLink size={11} /> VS Code
              </button>
              <button
                onClick={() => window.open(`cursor://file${project.path}`)}
                className="text-[11px] px-2 py-0.5 rounded border border-line hover:bg-elev text-fg-muted inline-flex items-center gap-1"
              >
                <ExternalLink size={11} /> Cursor
              </button>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="メッセージ数" value={String(project.total_messages)} />
          <Stat label="最終活動" value={format(parseISO(project.last_active), 'MM-dd HH:mm')} />
          <Stat label="初回活動" value={format(parseISO(project.first_seen), 'MM-dd HH:mm')} />
        </section>

        {/* Editable fields */}
        <section className="space-y-3">
          <Field label="次にやること（手動メモ）">
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              onBlur={() => save({ next_action_override: nextAction })}
              placeholder={(project.last_assistant_message || '').slice(0, 160) + '…'}
              className="w-full bg-elev border border-line rounded-md px-2.5 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </Field>

          <Field label="自由メモ">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => save({ note })}
              className="w-full bg-elev border border-line rounded-md px-2.5 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-fg cursor-pointer">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => {
                const v = e.target.checked;
                setHidden(v);
                save({ hidden: v });
              }}
              className="accent-indigo-500"
            />
            一覧から隠す
            <span className="text-[11px] text-fg-subtle">
              （サイドバー「表示」グループの「非表示も表示」で再表示）
            </span>
          </label>
        </section>

        {/* Conversation excerpts */}
        <section className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-fg-subtle inline-flex items-center gap-1.5">
            <MessageSquare size={11} /> 直近のやり取り
          </div>
          <Excerpt label="アシスタント" body={project.last_assistant_message} />
          <Excerpt label="ユーザー" body={project.last_user_message} />
          {project.source === 'codex' && (
            <div className="text-[11px] text-fg-subtle">
              ※ Codex は user query のみ取得可能（assistant 出力はローカル保存されません）
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-1">{label}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-elev border border-line rounded-md px-3 py-2">
      <div className="text-[10px] text-fg-subtle uppercase tracking-wider">{label}</div>
      <div className="text-sm text-fg-strong mt-0.5">{value}</div>
    </div>
  );
}

function Excerpt({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] text-fg-subtle mb-1">{label}</div>
      <pre className="bg-elev/60 border border-line rounded-md p-2.5 text-[11px] whitespace-pre-wrap break-words text-fg max-h-40 overflow-auto">
        {body || <span className="text-fg-faint">(なし)</span>}
      </pre>
    </div>
  );
}
