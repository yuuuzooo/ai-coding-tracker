# CHANGELOG

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
