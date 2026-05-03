# CHANGELOG

## 2026-05-04
### 依頼内容
ClaudeCode / Codex CLI で開始した開発プロジェクトを自動でリスト化し、最終やり取りと「次にやること」を一覧管理できるローカルツールを作りたい。途中で放置してしまった企画も後から再開しやすくする。

### 主な機能
- `~/.claude/projects/*/<sessionId>.jsonl` と `~/.codex/sessions/**/rollout-*.jsonl` を走査し、1セッション=1プロジェクト粒度で集約
- 自動抽出: `project_label`（最古セッションの最初の依頼）/ `current_status`（直近指示+対応）/ `entrypoint`（CLI / Desktop 判別）
- ステータス管理（進行中/保留/不要/完了/アイデア）、優先度ランク（A/B/C）
- ユーザー編集（手動メモ・自由メモ・エイリアス・hidden）は `~/.claude-pjx/overrides.json` に永続化
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
- 編集内容は `~/.claude-pjx/overrides.json` 単独管理。削除すれば全リセット
- API 書き込みは `127.0.0.1` 限定

### 配置
- ソース: `~/Desktop/000_Claude Code/dev/claude-pjx/`
- ランタイムデータ: `~/.claude-pjx/{index.json,overrides.json}`
- 起動: `npm run dev` → http://127.0.0.1:5180/
