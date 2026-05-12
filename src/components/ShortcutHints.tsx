import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useT } from '../i18n/useT';

export function ShortcutHints() {
  const [open, setOpen] = useState(false);
  const t = useT();

  const HINTS: Array<[string, string]> = [
    ['/', t.shortcutFocusSearch],
    ['j / k', t.shortcutMove],
    ['1–5', t.shortcutStatus],
    ['a / b / c', t.shortcutPriority],
    ['h', t.shortcutHide],
    ['Esc', t.shortcutEsc],
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={t.shortcuts}
        aria-label={t.shortcuts}
        className="fixed bottom-4 right-4 p-2 rounded-full bg-elev border border-line text-fg-muted hover:text-fg-strong hover:border-line z-40"
      >
        <Keyboard size={14} />
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-line rounded-lg p-5 w-full max-w-sm animate-toast-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-fg-strong">{t.shortcutsTitle}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="p-1 rounded text-fg-subtle hover:text-fg-strong"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="space-y-2">
              {HINTS.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-sm">
                  <kbd className="font-mono px-2 py-0.5 bg-elev border border-line rounded text-fg text-xs">
                    {k}
                  </kbd>
                  <span className="text-fg-muted">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
