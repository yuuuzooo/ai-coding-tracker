# AI Coding Tracker

ClaudeCode と Codex CLI で開始した開発プロジェクトを自動でリスト化し、最後のやり取りと「次にやること」を一画面で管理するローカル Web アプリ。

## できること

- `~/.claude/projects/*/<sessionId>.jsonl` を走査し、**1 セッション = 1 行**で集約（同一 cwd の別セッションは別行として扱う）
- `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` から Codex セッションのユーザー/アシスタント発言も取り込み（`~/.codex/session_index.jsonl` がある場合は thread name を補完）
- 最終アクティブ日時、最終ユーザー発言、最終アシスタント発言、最頻 cwd を自動抽出
- ステータス管理（active / paused / abandoned / done / idea）
- 「次にやること」の手動メモ、自由メモ、エイリアス、非表示トグル、A/B/C 優先度
- ステータス・優先度・ソース・起動方法・全文検索でフィルタ、チェックボックスによる一括処理
- 編集内容は `~/.ai-coding-tracker/overrides.json` に永続化（再スキャンで上書きされない）

## 配置

| パス | 用途 |
| --- | --- |
| `~/.ai-coding-tracker/index.json` | スキャン結果（自動生成） |
| `~/.ai-coding-tracker/overrides.json` | ユーザー編集（ステータス・メモ等） |

## 使い方

```bash
cd "~/Desktop/000_Claude Code/dev/ai-coding-tracker"
npm install      # 初回のみ
npm run dev      # http://127.0.0.1:5180/
```

ブラウザで `http://127.0.0.1:5180/` を開く。右上の「再スキャン」で最新状態に更新。

スキャナー単体実行:

```bash
npm run scan
```

## API（ローカル限定）

| Method | Path | 用途 |
| --- | --- | --- |
| GET | `/api/index` | プロジェクト一覧 |
| GET | `/api/overrides` | ユーザー編集 |
| PUT | `/api/overrides/:id` | 編集を保存 |
| DELETE | `/api/overrides/:id` | 編集を削除 |
| POST | `/api/rescan` | 即時再スキャン |

書き込み系は `127.0.0.1` からのみ受理。

## LaunchAgent で常駐させる（macOS）

ブラウザのブックマークから常時アクセスできるようにする設定。再起動しても自動で起動、プロセスが死んでも自動で再起動します。

```bash
# 1. テンプレートをコピー
cp LaunchAgents/com.zidai.ai-coding-tracker.plist ~/Library/LaunchAgents/

# 2. 自分の環境に合わせてパスを書き換え
#    - ProgramArguments の node / npm-cli.js
#      → `which node` と `which npm` で確認
#    - WorkingDirectory: ai-coding-tracker をクローンしたディレクトリ
#    - EnvironmentVariables.HOME: 自分のホームディレクトリ
vi ~/Library/LaunchAgents/com.zidai.ai-coding-tracker.plist

# 3. ロード（即起動 + ログイン時自動起動が有効になる）
launchctl load ~/Library/LaunchAgents/com.zidai.ai-coding-tracker.plist

# 状態確認
launchctl list | grep ai-coding-tracker
lsof -nP -iTCP:5180 -sTCP:LISTEN

# 停止
launchctl unload ~/Library/LaunchAgents/com.zidai.ai-coding-tracker.plist

# ログ
tail -f /tmp/ai-coding-tracker.log /tmp/ai-coding-tracker.error.log
```

これで http://127.0.0.1:5180/ がいつでもブラウザのブックマークからアクセス可能になります。

## ファイル構成

```
ai-coding-tracker/
├── LaunchAgents/
│   └── com.zidai.ai-coding-tracker.plist  # macOS 常駐用テンプレート
├── server/
│   ├── api.ts          # Vite middleware が呼ぶ API ハンドラ
│   ├── scanner.ts      # ~/.claude/projects と ~/.codex を走査
│   ├── overrides.ts    # overrides.json の atomic R/W
│   ├── paths.ts
│   ├── types.ts
│   └── run-scan.ts     # CLI エントリ
├── src/
│   ├── App.tsx
│   ├── store.ts        # Zustand
│   ├── api.ts          # fetch ラッパー
│   ├── types.ts
│   └── components/
│       ├── Toolbar.tsx
│       ├── ProjectList.tsx
│       ├── ProjectDetail.tsx
│       └── StatusBadge.tsx
└── vite.config.ts      # configureServer で API を同居
```

## 注意

- Codex の transcript は `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` からアシスタント発言も含めて取得する。`history.jsonl`（ユーザー入力のみ）は使っていない。rollout が無いセッションでは `last_assistant_message` が空になる場合がある。
- Claude Code の "user" メッセージにはツール結果も含まれるため、scanner 側で `<local-command-stdout>` / `<scheduled-task>` 等の自動挿入テキストはフィルタしている。「次にやること」は基本的に `last_assistant_message` を見る。
- セッション内で `cwd` が変わった場合は **最頻 cwd** を採用する（途中で `cd` した場合の誤分類対策）。
