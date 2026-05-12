export type Lang = 'en' | 'ja';

export const LANGS: Lang[] = ['en', 'ja'];

export type Strings = {
  // App
  appTitle: string;

  // Header / toolbar buttons (also used as aria-label)
  themeLight: string;
  themeDark: string;
  rescan: string;
  shortcuts: string;
  close: string;

  // Search
  searchPlaceholder: string;

  // Group titles
  groupStatus: string;
  groupPriority: string;
  groupSource: string;
  groupEntrypoint: string;
  groupSort: string;
  groupDisplay: string;

  // Pills
  pillAll: string;
  priorityUnset: string;
  entrypointBrowserNote: string;
  showHidden: (count: number) => string;

  // Sort modes
  sortLastActive: string;
  sortPriority: string;
  sortStatus: string;
  sortName: string;

  // Footer
  footerCount: (visible: number, total: number) => string;

  // Status
  statusActive: string;
  statusPaused: string;
  statusAbandoned: string;
  statusDone: string;
  statusIdea: string;

  // Bulk bar
  bulkSelectedCount: (n: number) => string;
  bulkStatus: string;
  bulkPriority: string;
  bulkApply: string;
  bulkApplying: string;
  bulkPrioritySelectPlaceholder: string;
  bulkClear: string;
  bulkClearTitle: string;
  bulkHide: string;
  bulkUnhide: string;
  bulkClearSelection: string;
  bulkResultPartial: (ok: number, failed: number) => string;

  // List header / row
  selectAllVisible: string;
  showing: (n: number) => string;
  emptyFiltered: string;
  emptyFilteredHint: string;
  rowCheckboxAriaLabel: string;

  // Date buckets
  bucketToday: string;
  bucketYesterday: string;
  bucketThisWeek: string;
  bucketThisMonth: string;
  bucketLast3Months: string;
  bucketOlder: string;

  // ProjectDetail
  resumeHeading: string;
  resumeUnknown: string;
  resumeDesktopHint: string;
  resumeCodexHint: string;
  workingDir: string;
  copy: string;
  statMessages: string;
  statLastActive: string;
  statFirstSeen: string;
  fieldNextAction: string;
  fieldNote: string;
  hideFromList: string;
  hideFromListHint: string;
  recentExchange: string;
  excerptAssistant: string;
  excerptUser: string;
  excerptEmpty: string;
  codexNote: string;
  saved: string;
  priorityNone: string;
  priorityLabel: (p: string) => string;
  editTitle: string;
  editTitleHover: string;

  // Empty (no data at all)
  emptyNoData: string;
  emptyNoDataBody: string;
  emptyNoDataHint: string;

  // CopyableCommand
  clickToCopy: string;

  // Shortcuts
  shortcutsTitle: string;
  shortcutFocusSearch: string;
  shortcutMove: string;
  shortcutStatus: string;
  shortcutPriority: string;
  shortcutHide: string;
  shortcutEsc: string;

  // Language toggle
  language: string;
};

export const en: Strings = {
  appTitle: 'AI Coding Tracker',

  themeLight: 'Switch to light theme',
  themeDark: 'Switch to dark theme',
  rescan: 'Rescan',
  shortcuts: 'Keyboard shortcuts',
  close: 'Close',

  searchPlaceholder: 'Search (press /)',

  groupStatus: 'Status',
  groupPriority: 'Priority',
  groupSource: 'Source',
  groupEntrypoint: 'Entrypoint',
  groupSort: 'Sort',
  groupDisplay: 'Display',

  pillAll: 'All',
  priorityUnset: 'Unset',
  entrypointBrowserNote:
    'Note: browser sessions (claude.ai/code) are not stored locally and cannot be detected.',
  showHidden: (count) => `Show hidden (${count})`,

  sortLastActive: 'Last active',
  sortPriority: 'Priority',
  sortStatus: 'Status',
  sortName: 'Name',

  footerCount: (visible, total) => `${visible} / ${total} shown`,

  statusActive: 'Active',
  statusPaused: 'Paused',
  statusAbandoned: 'Abandoned',
  statusDone: 'Done',
  statusIdea: 'Idea',

  bulkSelectedCount: (n) => `${n} selected`,
  bulkStatus: 'Status',
  bulkPriority: 'Priority',
  bulkApply: 'Apply',
  bulkApplying: 'Applying…',
  bulkPrioritySelectPlaceholder: '— pick —',
  bulkClear: 'Clear',
  bulkClearTitle: 'Reset priority to unset',
  bulkHide: 'Hide',
  bulkUnhide: 'Unhide',
  bulkClearSelection: 'Clear selection',
  bulkResultPartial: (ok, failed) => `${ok} applied, ${failed} failed`,

  selectAllVisible: 'Select all visible',
  showing: (n) => `${n} shown`,
  emptyFiltered: 'No projects match the current filters.',
  emptyFilteredHint: 'Relax the filters or change the search term.',
  rowCheckboxAriaLabel: 'Select project',

  bucketToday: 'Today',
  bucketYesterday: 'Yesterday',
  bucketThisWeek: 'This week',
  bucketThisMonth: 'This month',
  bucketLast3Months: 'Last 3 months',
  bucketOlder: 'Older',

  resumeHeading: 'Resume from here',
  resumeUnknown: "Couldn't determine how this session was started.",
  resumeDesktopHint: 'You can also resume from the Claude Desktop chat history.',
  resumeCodexHint: 'Tip: `codex resume` alone lets you pick a session interactively.',
  workingDir: 'Working directory',
  copy: 'Copy',
  statMessages: 'Messages',
  statLastActive: 'Last active',
  statFirstSeen: 'First seen',
  fieldNextAction: 'Next action (manual note)',
  fieldNote: 'Free note',
  hideFromList: 'Hide from list',
  hideFromListHint: '(toggle "Show hidden" in the sidebar to bring it back)',
  recentExchange: 'Most recent exchange',
  excerptAssistant: 'Assistant',
  excerptUser: 'User',
  excerptEmpty: '(none)',
  codexNote:
    "Codex only stores the user query locally; the assistant's reply may be empty.",
  saved: 'Saved',
  priorityNone: 'No priority',
  priorityLabel: (p) => `Priority ${p}`,
  editTitle: 'Edit display name',
  editTitleHover: 'Click to edit',

  emptyNoData:
    "We couldn't find any Claude Code or Codex sessions on this machine.",
  emptyNoDataBody:
    'AI Coding Tracker reads session history from the following directories:',
  emptyNoDataHint:
    'If your sessions live elsewhere (e.g. WSL or a non-standard install), set AICT_CLAUDE_PROJECTS_DIR / AICT_CODEX_SESSIONS_DIR before starting the server.',

  clickToCopy: 'Click to copy',

  shortcutsTitle: 'Keyboard shortcuts',
  shortcutFocusSearch: 'Focus search',
  shortcutMove: 'Move down / up (↓↑ also work)',
  shortcutStatus: 'Change status (active / paused / abandoned / done / idea)',
  shortcutPriority: 'Set priority A / B / C',
  shortcutHide: 'Toggle hidden',
  shortcutEsc: 'Clear selection / close detail',

  language: 'Language',
};

export const ja: Strings = {
  appTitle: 'AI Coding Tracker',

  themeLight: 'ライトモードに切り替え',
  themeDark: 'ダークモードに切り替え',
  rescan: '再スキャン',
  shortcuts: 'キーボードショートカット',
  close: '閉じる',

  searchPlaceholder: '検索 (押下 /)',

  groupStatus: 'ステータス',
  groupPriority: '優先度',
  groupSource: 'ソース',
  groupEntrypoint: '起動方法',
  groupSort: '並び順',
  groupDisplay: '表示',

  pillAll: 'すべて',
  priorityUnset: '未設定',
  entrypointBrowserNote: '※ ブラウザ版（claude.ai/code）はローカルに履歴が保存されないため検知不可',
  showHidden: (count) => `非表示も表示 (${count})`,

  sortLastActive: '最終活動順',
  sortPriority: '優先度順',
  sortStatus: 'ステータス順',
  sortName: '名前順',

  footerCount: (visible, total) => `${visible} / ${total} 件`,

  statusActive: '進行中',
  statusPaused: '保留',
  statusAbandoned: '不要',
  statusDone: '完了',
  statusIdea: 'アイデア',

  bulkSelectedCount: (n) => `${n} 件選択`,
  bulkStatus: 'ステータス',
  bulkPriority: '優先度',
  bulkApply: '適用',
  bulkApplying: '適用中…',
  bulkPrioritySelectPlaceholder: '— 選択 —',
  bulkClear: 'クリア',
  bulkClearTitle: '優先度を未設定に戻す',
  bulkHide: '隠す',
  bulkUnhide: '戻す',
  bulkClearSelection: '選択解除',
  bulkResultPartial: (ok, failed) => `${ok}件適用、${failed}件失敗`,

  selectAllVisible: '表示中をすべて選択',
  showing: (n) => `${n} 件表示中`,
  emptyFiltered: '該当するプロジェクトがありません',
  emptyFilteredHint: 'フィルタを緩めるか、検索ワードを変えてみてください',
  rowCheckboxAriaLabel: '選択',

  bucketToday: '今日',
  bucketYesterday: '昨日',
  bucketThisWeek: '今週',
  bucketThisMonth: '今月',
  bucketLast3Months: '3ヶ月以内',
  bucketOlder: 'それ以前',

  resumeHeading: '続きから再開',
  resumeUnknown: '起動方法を判定できませんでした',
  resumeDesktopHint: '※ Claude Desktop アプリのチャット履歴からも再開できます',
  resumeCodexHint: '※ codex resume 単体で対話的にセッション選択も可',
  workingDir: '作業ディレクトリ',
  copy: 'コピー',
  statMessages: 'メッセージ数',
  statLastActive: '最終活動',
  statFirstSeen: '初回活動',
  fieldNextAction: '次にやること（手動メモ）',
  fieldNote: '自由メモ',
  hideFromList: '一覧から隠す',
  hideFromListHint: '（サイドバー「表示」グループの「非表示も表示」で再表示）',
  recentExchange: '直近のやり取り',
  excerptAssistant: 'アシスタント',
  excerptUser: 'ユーザー',
  excerptEmpty: '(なし)',
  codexNote: '※ Codex は user query のみ取得可能（assistant 出力は空のことがあります）',
  saved: '保存',
  priorityNone: '優先度なし',
  priorityLabel: (p) => `優先度 ${p}`,
  editTitle: '表示名を編集',
  editTitleHover: 'クリックで編集',

  emptyNoData:
    'このマシンでは Claude Code / Codex のセッションが見つかりませんでした。',
  emptyNoDataBody:
    'AI Coding Tracker は以下のディレクトリからセッション履歴を読み取ります:',
  emptyNoDataHint:
    'WSL や非標準パスを使っている場合、サーバー起動前に AICT_CLAUDE_PROJECTS_DIR / AICT_CODEX_SESSIONS_DIR を設定してください。',

  clickToCopy: 'クリックでコピー',

  shortcutsTitle: 'キーボードショートカット',
  shortcutFocusSearch: '検索にフォーカス',
  shortcutMove: '下/上に移動（↓↑も可）',
  shortcutStatus: 'ステータス変更（進行中/保留/不要/完了/アイデア）',
  shortcutPriority: '優先度を A/B/C にセット',
  shortcutHide: '一覧から隠す ⇄ 表示',
  shortcutEsc: '選択解除 / 詳細を閉じる',

  language: '言語',
};

export const STRINGS: Record<Lang, Strings> = { en, ja };

export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = navigator.languages ?? [navigator.language];
  for (const c of candidates) {
    if (c && c.toLowerCase().startsWith('ja')) return 'ja';
  }
  return 'en';
}
