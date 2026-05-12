import { FolderOpen, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { useT } from '../i18n/useT';

export function EmptyState() {
  const triggerRescan = useStore((s) => s.triggerRescan);
  const loading = useStore((s) => s.loading);
  const t = useT();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-lg text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-elev border border-line">
          <FolderOpen size={26} className="text-fg-subtle" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-fg-strong">{t.emptyNoData}</h2>
          <p className="text-sm text-fg-muted">{t.emptyNoDataBody}</p>
        </div>
        <div className="bg-elev/60 border border-line rounded-md p-3 text-left">
          <ul className="font-mono text-[12px] text-fg space-y-1">
            <li>~/.claude/projects/</li>
            <li>~/.codex/sessions/</li>
          </ul>
        </div>
        <p className="text-xs text-fg-subtle leading-relaxed">{t.emptyNoDataHint}</p>
        <button
          onClick={() => triggerRescan()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-line bg-elev hover:bg-line text-sm text-fg disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t.rescan}
        </button>
      </div>
    </div>
  );
}
