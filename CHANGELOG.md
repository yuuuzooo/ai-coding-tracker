# CHANGELOG

## 2026-05-13 (2)
### 依頼内容
OSS 配布に向けた整備と、英語圏のユーザーが触れるよう英語対応する。

### 変更内容
- **LICENSE**: MIT を追加
- **package.json**: `description` / `license` / `author` / `homepage` / `repository` / `bugs` / `keywords` / `engines (node >= 18.17.0)` を追加
- **i18n 基盤**（en / ja の 2 言語）
  - `src/i18n/strings.ts` に翻訳辞書を集約、`detectLang()` で `navigator.language` 検出
  - `src/i18n/useT.ts` フックでコンポーネントから参照
  - 言語設定は `localStorage` (`ai-coding-tracker:lang`) に永続化、Sidebar ヘッダにトグル
  - 全 UI コンポーネント（Sidebar / BulkBar / ProjectList / ProjectDetail / ShortcutHints / CopyableCommand / StatusBadge / EmptyState）の日本語ハードコード文字列を `t.*` 経由に置換
  - 日付バケットも `BucketKey` 列挙型 + ローカライズ関数で多言語化
  - `formatDistanceToNow` の locale を `lang` に応じて `enUS` / `ja` 切替
- **環境変数によるパス上書き**（WSL / 非標準配置ユーザー向け）
  - `AICT_CLAUDE_PROJECTS_DIR` / `AICT_CODEX_DIR` / `AICT_CODEX_SESSIONS_DIR` / `AICT_DATA_DIR`
  - `server/paths.ts` の `envPath()` ヘルパで実装、絶対パス化込み
- **空表示ガイド**: `EmptyState.tsx` を追加。`~/.claude/projects` / `~/.codex/sessions` どちらも空の場合に原因と対処を表示
- **URL escape + a11y**
  - `vscode://file{path}` / `cursor://file{path}` の path を `encodeURI()`
  - icon-only ボタン（theme toggle / 再スキャン / 言語切替 / Edit pencil / Close / CopyableCommand / ShortcutHints）に `aria-label` 追加
- **デプロイテンプレート**
  - `LaunchAgents/com.zidai.ai-coding-tracker.plist.example` の個人情報を `__REPLACE_*__` placeholder 化
  - `systemd/ai-coding-tracker.service.example` を新規追加（Linux ユーザー向け）
- **README 全面書き直し**: 英語ファースト + 末尾に日本語版。Features / Requirements / Install / Configuration / API / Service / Data / Safety / Known limitations / License を整理

### 動作確認
- `npx tsc --noEmit` クリーン
- LaunchAgent 再起動済み、port 5180 で稼働、`GET /api/index` で 522 プロジェクト取得
- `POST /api/rescan` (Origin あり) 200
- 環境変数 `AICT_CLAUDE_PROJECTS_DIR=/tmp/test-claude AICT_DATA_DIR=/tmp/test-data` で起動した paths.ts が期待通り解決

## 2026-05-13
### 依頼内容
Codex CLI でコードレビューしてもらい、Critical / Important の指摘を機能影響を出さずに直す。

### 変更内容
- 🔴 **`overrides.json` 破損保護**（`server/overrides.ts`）
  - parse 失敗時に `{}` を返さず `OverridesCorruptError` を throw。書き込み系がデータロスを起こさなくなった
  - 破損ファイルは `overrides.json.corrupt.<ISO timestamp>` に自動退避
  - API 層で 500 + `{error, backup}` を返却
- 🟡 **API ハードニング**（`server/api.ts`）
  - body size 上限 64KB、超過時 413 `payload too large`
  - `Origin` ヘッダがある場合のみ `127.0.0.1` / `localhost` を許可（CSRF 対策）。`curl` 等 Origin 無しのリクエストは従来通り通る
  - 書き込み系を `guardWrite()` に集約
  - 500 エラーメッセージから内部詳細を除き汎用化、`SyntaxError` は 400、`PayloadTooLargeError` は 413 に分離
- 🟡 **scanner**（`server/scanner.ts`）
  - セッション内で `cwd` が変わった場合、**最頻 cwd** を採用（`cwd_counts` 集計）。長セッション/途中 `cd` での誤分類対策
  - `~/.claude/projects` 配下と Codex sessions 走査で `lstat()` + Dirent `isSymbolicLink()` チェックを追加し symlink ディレクトリ/ファイルを skip
- 🟡 **フィルタロジック共通化**
  - `src/store.ts` に `selectVisibleProjects()` を追加
  - `ProjectList.tsx` と `useKeyboardShortcuts.ts` の重複ロジックを削除し、`j/k` 移動と一覧表示が常に同じ集合を見るように
  - `useKeyboardShortcuts` 側の検索が `displayName / alias` を含むように（仕様統一）
- 🟢 README 更新（`README.md`）
  - 「cwd 単位で集約」 → 「1 セッション = 1 行」に修正（実装に合致）
  - Codex のソースを `session_index.jsonl + history.jsonl` → `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` に更新
  - 注意セクションに最頻 cwd 採用を明記

### 動作確認
- `npx tsc --noEmit` 型エラーなし
- LaunchAgent 再起動 → port 5180 LISTEN 確認
- `GET /api/index` 518 プロジェクト取得（rename 前と同一）
- `POST /api/rescan` Origin なし: 200 / Origin `evil.example.com`: 403 / Origin `127.0.0.1:5180`: 200
- `POST /api/overrides/bulk` 78KB body: 413 `payload too large` / 空 body: 200
- 破損 `overrides.json` を投入すると `OverridesCorruptError` + `.corrupt.<ts>` への退避を確認

## 2026-05-05
### 依頼内容
ツール名を「claude-pjx」から、Claude Code と Codex の両方を扱う実体に合致した万人にわかりやすい名前に変更したい。

### 変更内容
- プロジェクト名を **claude-pjx → ai-coding-tracker** に rename
  - GitHub: yuuuzooo/claude-pjx → yuuuzooo/ai-coding-tracker（Private 維持）
  - ローカルディレクトリ: `~/Desktop/000_Claude Code/dev/ai-coding-tracker/`
  - ランタイムデータ: `~/.ai-coding-tracker/{index.json, overrides.json}`（既存データを mv で移行）
  - LaunchAgent: `com.zidai.ai-coding-tracker`（旧 plist は削除、新 plist を `~/Library/LaunchAgents/` にロード）
  - ログ: `/tmp/ai-coding-tracker.log` / `/tmp/ai-coding-tracker.error.log`
  - ブラウザ UI 表示: サイドバーの見出しを「AI Coding Tracker」に変更
- `package.json` の name、`vite.config.ts` の plugin 名、`localStorage` キー（`ai-coding-tracker:theme`）も追従
- CHANGELOG / README / 各種ドキュメント・コード内の参照を一括置換
- 動作確認: LaunchAgent 起動済み、http://127.0.0.1:5180/ でアクセス可能

## 2026-05-04 (2)
### 変更内容
- `LaunchAgents/com.zidai.ai-coding-tracker.plist` テンプレートを追加（macOS 常駐用）
- README の LaunchAgent セクションをテンプレート参照ベースに書き換え（コピー → パス調整 → load の3手順）
- `~/Library/LaunchAgents/com.zidai.ai-coding-tracker.plist` を実体化して `launchctl load`、ポート 5180 で常駐確認済み
- 効果: Claude Code セッション終了後・Mac 再起動後も `http://127.0.0.1:5180/` のブックマークから即アクセス可能

## 2026-05-04
### 依頼内容
ClaudeCode / Codex CLI で開始した開発プロジェクトを自動でリスト化し、最終やり取りと「次にやること」を一覧管理できるローカルツールを作りたい。途中で放置してしまった企画も後から再開しやすくする。

### 主な機能
- `~/.claude/projects/*/<sessionId>.jsonl` と `~/.codex/sessions/**/rollout-*.jsonl` を走査し、1セッション=1プロジェクト粒度で集約
- 自動抽出: `project_label`（最古セッションの最初の依頼）/ `current_status`（直近指示+対応）/ `entrypoint`（CLI / Desktop 判別）
- ステータス管理（進行中/保留/不要/完了/アイデア）、優先度ランク（A/B/C）
- ユーザー編集（手動メモ・自由メモ・エイリアス・hidden）は `~/.ai-coding-tracker/overrides.json` に永続化
- Codex は rollout jsonl からアシスタント発言・cwd まで取得（`history.jsonl` のみだった以前は user query のみ）

### UX
- 左サイドバー: 検索 / ステータス pill（件数バッジ付）/ 優先度 / ソース / 起動方法 / 並び順
- ステータス左ストライプ + 日付バケット（今日/昨日/今週/今月/3ヶ月以内/それ以前）
- 詳細パネル sticky ヘッダ、再開コマンドを最上部へ昇格、タイトル直接編集（ペンアイコン）
- 一括処理: チェックボックス選択 + ステータス/優先度/hidden を1リクエスト bulk で適用（書き込みロック付き）
- キーボードショートカット: `/` 検索、`j/k` 上下、`1-5` ステータス、`a/b/c` 優先度、`h` hidden、`Esc` 解除
- ライト/ダークモード切替（CSS変数 + Tailwind セマンティックトークン）

### 技術構成
- React 18 + TypeScript + Vite + Tailwind CSS + Zustand + lucide-react
- Vite middleware で API（`/api/index` `/api/overrides` `/api/overrides/bulk` `/api/rescan`）を同居
- 書き込みロック（`withWriteLock`）で並列 PUT の競合防止
- atomic write（tmp + rename + ランダム suffix）

### 安全性
- 全データソースは読み取り専用（Claude Code/Codex の jsonl・SQLite には一切書き込まない）
- 編集内容は `~/.ai-coding-tracker/overrides.json` 単独管理。削除すれば全リセット
- API 書き込みは `127.0.0.1` 限定

### 配置
- ソース: `~/Desktop/000_Claude Code/dev/ai-coding-tracker/`
- ランタイムデータ: `~/.ai-coding-tracker/{index.json,overrides.json}`
- 起動: `npm run dev` → http://127.0.0.1:5180/
