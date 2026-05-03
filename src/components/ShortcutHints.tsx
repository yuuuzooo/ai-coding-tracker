import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const HINTS: Array<[string, string]> = [
  ['/', '検索にフォーカス'],
  ['j / k', '下/上に移動（↓↑も可）'],
  ['1〜5', 'ステータス変更（進行中/保留/不要/完了/アイデア）'],
  ['a / b / c', '優先度を A/B/C にセット'],
  ['h', '一覧から隠す ⇄ 表示'],
  ['Esc', '選択解除 / 詳細を閉じる'],
];

export function ShortcutHints() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="キーボードショートカット"
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
              <h3 className="font-medium text-fg-strong">キーボードショートカット</h3>
              <button
                onClick={() => setOpen(false)}
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
