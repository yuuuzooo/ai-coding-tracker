# claude-pjx

ClaudeCode と Codex CLI で開始した開発プロジェクトを自動でリスト化し、最後のやり取りと「次にやること」を一画面で管理するローカル Web アプリ。

## できること

- `~/.claude/projects/*/<uuid>.jsonl` を走査し、`cwd` 単位でプロジェクトに集約
- `~/.codex/session_index.jsonl` + `history.jsonl` から Codex のスレッドも取り込み
- 最終アクティブ日時、最終ユーザー発言、最終アシスタント発言を自動抽出
- ステータス管理（active / paused / abandoned / done / idea）
- 「次にやること」の手動メモ、自由メモ、エイリアス、非表示トグル
- ステータス・ソース・全文検索でフィルタ
- 編集内容は `~/.claude-pjx/overrides.json` に永続化（再スキャンで上書きされない）

## 配置

| パス | 用途 |
| --- | --- |
| `~/.claude-pjx/index.json` | スキャン結果（自動生成） |
| `~/.claude-pjx/overrides.json` | ユーザー編集（ステータス・メモ等） |

## 使い方

```bash
cd "~/Desktop/000_Claude Code/dev/claude-pjx"
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

## LaunchAgent で常駐させる（任意）

`~/Library/LaunchAgents/com.zidai.claude-pjx.plist` を作成:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.zidai.claude-pjx</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd "$HOME/Desktop/000_Claude Code/dev/claude-pjx" && /usr/local/bin/npm run dev</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/claude-pjx.out.log</string>
  <key>StandardErrorPath</key><string>/tmp/claude-pjx.err.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.zidai.claude-pjx.plist
```

`/usr/local/bin/npm` のパスは `which npm` で確認して書き換えること。

## ファイル構成

```
claude-pjx/
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

- Codex の transcript は `~/.codex/history.jsonl` にユーザー入力のみ保存されるため、`last_assistant_message` は空。詳細パネルに注記表示。
- Claude Code の "user" メッセージにはツール結果も含まれるため、`last_user_message` がツール出力になることがある（仕様）。「次にやること」は基本的に `last_assistant_message` を見る。
