import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useT } from '../i18n/useT';

export function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const t = useT();

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={onClick}
      title={t.clickToCopy}
      aria-label={t.clickToCopy}
      className="font-mono bg-elev px-2 py-1 rounded border border-line hover:bg-line text-[11px] inline-flex items-center gap-1.5 max-w-full"
    >
      {copied ? (
        <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <Copy size={12} className="text-fg-muted shrink-0" />
      )}
      <span className="truncate">{command}</span>
    </button>
  );
}
