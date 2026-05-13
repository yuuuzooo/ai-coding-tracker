# Contributing to AI Coding Tracker

Thanks for your interest in contributing! This project is intentionally small and framework-light — most changes don't require deep prior context.

## Quick start

```bash
git clone https://github.com/yuuuzooo/ai-coding-tracker.git
cd ai-coding-tracker
npm install
npm run dev        # http://127.0.0.1:5180/
```

That's it. The Vite dev server hot-reloads everything (React UI + the Node middleware that serves `/api/*`).

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dashboard on port 5180 |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run build` | Production bundle (output in `dist/`) |
| `npm run preview` | Serve the production bundle |
| `npm run scan` | Trigger a one-shot scan from the CLI |
| `node scripts/generate-demo-data.mjs` | Generate synthetic data for screenshots / docs |

### Working without real sessions

If you don't have local Claude Code / Codex history (or want to avoid leaking your own data into screenshots), use the demo generator:

```bash
node scripts/generate-demo-data.mjs

AICT_DATA_DIR=/tmp/aict-demo \
AICT_CLAUDE_PROJECTS_DIR=/tmp/aict-demo/__none__ \
AICT_CODEX_SESSIONS_DIR=/tmp/aict-demo/__none__ \
npm run dev -- --port 5181
```

This spins up a separate dashboard on `:5181` with 12 synthetic projects — independent from your real install.

## Codebase orientation

```
server/        # Vite middleware (API) + JSONL scanner
  scanner.ts   # Reads ~/.claude/projects and ~/.codex/sessions
  api.ts       # /api/index, /api/overrides, /api/rescan
  overrides.ts # Atomic R/W on ~/.ai-coding-tracker/overrides.json
  paths.ts     # All path constants live here (env-var overridable)

src/           # React 18 + TypeScript + Tailwind + Zustand
  components/  # UI building blocks
  hooks/       # useTheme, useKeyboardShortcuts
  i18n/        # English + Japanese translations
  store.ts     # Zustand store, selectors, filter logic
  api.ts       # fetch wrappers
```

## Pull request guidelines

1. **Open an issue first** for anything non-trivial. A 10-line drive-by fix is fine to submit directly; a new feature, refactor, or behavior change benefits from a quick discussion.
2. **One concern per PR.** Mixing unrelated changes makes review harder.
3. **Keep the diff small.** If you're refactoring, do that in a separate PR from the feature/fix.
4. **No new dependencies without discussion.** The current stack is intentionally minimal.
5. **Update both English and Japanese translations** when adding or changing UI strings. They live in `src/i18n/strings.ts`.
6. **Include screenshots** for UI changes (light + dark mode if relevant).
7. **`npm run typecheck && npm run build` must pass.** The CI runs them on Node 18, 20, and 22.

## Coding style

- **TypeScript everywhere.** Prefer typed over `any`.
- **No comments that just describe what code does** — well-named identifiers carry that. Reserve comments for non-obvious WHY (hidden constraints, workarounds, surprising behavior).
- **Small files, small functions.** This is a personal-tool codebase; keep it readable.
- **Match existing patterns.** Look at how surrounding code is written before introducing a new convention.

## Safety constraints (do not break)

This tool's core promise is **never to write to** `~/.claude/` or `~/.codex/`. Please preserve:

- All write operations target `~/.ai-coding-tracker/` only (via `PJX_DIR` in `server/paths.ts`).
- No `unlink` / `rm` / `rmdir` / `child_process` / `exec` / `spawn` calls anywhere.
- API id parameters validated against `^[A-Za-z0-9_-]+$` before reaching `path.join`.
- Symlinks in source directories are skipped.

If your change touches `server/scanner.ts`, `server/overrides.ts`, or `server/api.ts`, please double-check these invariants.

## Reporting security issues

Please **don't open a public issue** for security vulnerabilities. Email the maintainer (see `package.json` author field) instead, or open a draft GitHub Security Advisory.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
