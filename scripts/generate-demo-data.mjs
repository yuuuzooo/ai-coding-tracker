#!/usr/bin/env node
// Generate synthetic demo data for screenshots / docs.
// Usage:
//   AICT_DEMO_DIR=/tmp/aict-demo node scripts/generate-demo-data.mjs
//
// Then launch a separate dev server pointed at this dir on a different port:
//   AICT_DATA_DIR=/tmp/aict-demo \
//   AICT_CLAUDE_PROJECTS_DIR=/tmp/aict-demo/__none__ \
//   AICT_CODEX_SESSIONS_DIR=/tmp/aict-demo/__none__ \
//   npm run dev -- --port 5181

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = process.env.AICT_DEMO_DIR || '/tmp/aict-demo';
fs.mkdirSync(OUT_DIR, { recursive: true });

const NOW = Date.now();
const hrs = (h) => new Date(NOW - h * 3_600_000).toISOString();
const days = (d) => new Date(NOW - d * 86_400_000).toISOString();

function id(seed) {
  return crypto.createHash('sha1').update(`demo|${seed}`).digest('hex').slice(0, 16);
}

/**
 * @param {Partial<import('../server/types').ScannedProject> & {
 *   seed: string;
 *   source: 'claude-code' | 'codex';
 *   entrypoint: 'cli' | 'desktop' | 'unknown';
 *   label: string;
 *   topic: string;
 *   path?: string | null;
 *   lastActive: string;
 *   firstSeen: string;
 *   totalMessages: number;
 *   user: string;
 *   assistant: string;
 * }} p
 */
function project(p) {
  return {
    id: id(p.seed),
    source: p.source,
    entrypoint: p.entrypoint,
    name: p.name ?? (p.path ? path.basename(p.path) : p.seed),
    path: p.path ?? null,
    session_count: p.session_count ?? 1,
    first_seen: p.firstSeen,
    last_active: p.lastActive,
    last_user_message: p.user,
    last_assistant_message: p.assistant,
    last_session_id:
      p.last_session_id ??
      `${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(6).toString('hex')}`,
    total_messages: p.totalMessages,
    project_label: p.label,
    current_status: p.topic,
    topic: p.topic,
    auto_label: p.label,
  };
}

const PROJECTS = [
  project({
    seed: 'realtime-collab',
    source: 'claude-code',
    entrypoint: 'cli',
    path: '/Users/dev/code/realtime-collab',
    label: 'Realtime collaborative editor with CRDT sync',
    topic: 'Wired Yjs into the editor; need to add presence avatars next.',
    lastActive: hrs(2),
    firstSeen: days(8),
    totalMessages: 142,
    user: 'Can you add the avatar overlay that shows who is typing where?',
    assistant:
      'Done. Added PresenceLayer that subscribes to awareness updates and renders an absolutely-positioned cursor + name tag for each peer. Mounted it inside <EditorRoot/>. Try opening two tabs.',
  }),
  project({
    seed: 'ledger-cli',
    source: 'codex',
    entrypoint: 'cli',
    path: '/Users/dev/code/ledger-cli',
    label: 'Personal finance CLI with double-entry bookkeeping',
    topic: 'Importer for CSV done; reconciliation report still TODO.',
    lastActive: hrs(5),
    firstSeen: days(12),
    totalMessages: 87,
    user: 'add a `ledger reconcile <account>` command that diffs imported transactions against the journal',
    assistant:
      'Sketched the command in src/commands/reconcile.ts. It loads the journal, indexes imported rows by (date, amount, payee fuzzy match), and prints unmatched entries on each side. Tests still pending.',
  }),
  project({
    seed: 'sparkle-design',
    source: 'claude-code',
    entrypoint: 'desktop',
    path: '/Users/dev/work/sparkle-design',
    label: 'Sparkle design system — component library refresh',
    topic: 'Migrated Button + Input; Tooltip still uses legacy portal API.',
    lastActive: hrs(20),
    firstSeen: days(20),
    totalMessages: 213,
    user: 'why is Tooltip still rendering inside the parent div instead of a portal?',
    assistant:
      'Because <Tooltip> v1 used Floating UI before they renamed the portal export. The shim in src/legacy/tooltip-portal.ts is stale. I refactored it to use @floating-ui/react FloatingPortal directly — see commit on the migration branch.',
  }),
  project({
    seed: 'k8s-operator',
    source: 'claude-code',
    entrypoint: 'cli',
    path: '/Users/dev/code/k8s-vault-operator',
    label: 'Kubernetes operator that syncs secrets from Vault',
    topic: 'Watcher works in dev cluster; flaky on EKS due to IRSA timing.',
    lastActive: days(2),
    firstSeen: days(45),
    totalMessages: 308,
    user: 'the controller pod gets 403 on first sync after pod startup but works on retry — what is going on?',
    assistant:
      'IRSA tokens take a few seconds to be projected after pod start. Your reconcile loop starts immediately and races. Easiest fix: wrap the Vault client init with retry+backoff (cap 30s) and only start the informer once auth succeeds.',
  }),
  project({
    seed: 'recipe-rec',
    source: 'codex',
    entrypoint: 'cli',
    path: '/Users/dev/code/recipe-rec',
    label: 'Recipe recommender that takes pantry photo + dietary prefs',
    topic: 'Vision pipeline returns ingredient list; retrieval prompt next.',
    lastActive: days(3),
    firstSeen: days(6),
    totalMessages: 54,
    user: 'pipe the detected ingredients into an embedding lookup against our recipe corpus',
    assistant:
      'Added build_query() that concatenates ingredients with simple weighting (proteins first), embeds via text-embedding-3-small, and queries the pgvector index with cosine sim k=20. Returns a ranked candidate list before LLM rerank.',
  }),
  project({
    seed: 'svg-icon-tool',
    source: 'claude-code',
    entrypoint: 'cli',
    path: '/Users/dev/code/svg-icon-tool',
    label: 'CLI that normalizes and lints SVG icon sets',
    topic: 'lint rules done; need a `--fix` mode that rewrites paths.',
    lastActive: days(5),
    firstSeen: days(15),
    totalMessages: 41,
    user: 'add --fix that snaps stroke widths to the nearest 0.5',
    assistant:
      'Added Fixer in src/fixers/stroke-snap.ts. It walks the AST, rounds stroke-width to nearest 0.5, and reports diffs. Wired into CLI behind --fix. Currently dry-run by default; pass --write to overwrite files.',
  }),
  project({
    seed: 'cron-dashboard',
    source: 'claude-code',
    entrypoint: 'desktop',
    path: '/Users/dev/work/cron-dashboard',
    label: 'Internal dashboard for monitoring scheduled jobs',
    topic: 'UI prototype only — no auth/RBAC yet.',
    lastActive: days(9),
    firstSeen: days(30),
    totalMessages: 78,
    user: 'render the next 24h timeline of cron jobs',
    assistant:
      'Built a horizontal timeline with hour ticks. Each job draws a marker at its next fire time computed by cron-parser. Hover shows last run status and duration. Live in <UpcomingTimeline/>.',
  }),
  project({
    seed: 'audio-trim',
    source: 'codex',
    entrypoint: 'cli',
    path: '/Users/dev/code/audio-trim',
    label: 'Silence-trimmer for podcast post-production',
    topic: 'Detects silence reliably; UI loop for review still planned.',
    lastActive: days(11),
    firstSeen: days(25),
    totalMessages: 39,
    user: 'expose silence threshold and min-duration as flags',
    assistant:
      'Added --threshold-db (default -42) and --min-silence-ms (default 800) flags. Threshold maps to ffmpeg silencedetect filter. Tested on 3 sample episodes — output sounds clean.',
  }),
  project({
    seed: 'rust-game',
    source: 'claude-code',
    entrypoint: 'cli',
    path: '/Users/dev/play/rust-roguelike',
    label: 'Tiny roguelike in Rust + Bevy (weekend project)',
    topic: 'Tiles + player movement; FOV next.',
    lastActive: days(18),
    firstSeen: days(28),
    totalMessages: 33,
    user: 'add field-of-view using symmetric shadowcasting',
    assistant:
      "Implemented in src/fov.rs based on Adam Milazzo's algorithm. Returns a set of visible tiles per turn; works correctly for the 4 sample maps I checked. Visualize by tinting non-visible tiles in the renderer.",
  }),
  project({
    seed: 'data-pipeline',
    source: 'codex',
    entrypoint: 'cli',
    path: '/Users/dev/code/etl-pipeline',
    label: 'Nightly ETL pipeline migrating Postgres → BigQuery',
    topic: 'Schema drift between source and warehouse caused last failure.',
    lastActive: days(22),
    firstSeen: days(60),
    totalMessages: 191,
    user: 'why did last night\'s load fail with "column user_id does not exist"?',
    assistant:
      'Source table got user_uuid renamed two days ago and your dbt model still references user_id. Add a rename in the staging model or update the dbt source schema. Long-term: hook source-table DDL changes into a CI alert.',
  }),
  project({
    seed: 'ml-experiment',
    source: 'claude-code',
    entrypoint: 'cli',
    path: '/Users/dev/research/ml-classifier',
    label: 'Small text classifier — model selection sweep',
    topic: 'logistic regression baseline beat distilbert at this size.',
    lastActive: days(40),
    firstSeen: days(55),
    totalMessages: 25,
    user: 'TF-IDF + logistic regression vs distilbert on 2k samples?',
    assistant:
      'On your dataset, TF-IDF + LR hits 0.87 F1; fine-tuned distilbert hits 0.86. At this size, the baseline wins on cost and latency. Recommend shipping LR unless you scale data 5-10x.',
  }),
  project({
    seed: 'old-bot',
    source: 'codex',
    entrypoint: 'cli',
    path: '/Users/dev/code/scratch-bot',
    label: 'Slack bot that summarizes channel activity',
    topic: 'Working prototype but never deployed.',
    lastActive: days(95),
    firstSeen: days(120),
    totalMessages: 18,
    user: 'summarize unread messages when I run /catchup',
    assistant:
      'Bot listens for /catchup slash command, fetches messages since the user\'s last_read, and posts a Claude-generated summary back to the user as an ephemeral message.',
  }),
];

const indexFile = {
  generated_at: new Date(NOW).toISOString(),
  projects: PROJECTS.sort((a, b) => (a.last_active < b.last_active ? 1 : -1)),
};

const overrides = {
  [id('realtime-collab')]: {
    status: 'active',
    priority: 'A',
    next_action_override:
      'Wire presence avatars + add reconnect throttling before the Friday demo.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('ledger-cli')]: {
    status: 'active',
    priority: 'B',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('sparkle-design')]: {
    status: 'active',
    priority: 'A',
    note: 'Coordinate with @design before bumping major.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('k8s-operator')]: {
    status: 'paused',
    priority: 'B',
    next_action_override: 'Wait for EKS IRSA fix to land in v1.29 cluster.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('recipe-rec')]: {
    status: 'idea',
    priority: 'C',
    note: 'Weekend project. Could become a side product.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('svg-icon-tool')]: {
    status: 'paused',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('cron-dashboard')]: {
    status: 'done',
    priority: 'C',
    alias: 'Job Watch (v1)',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('audio-trim')]: {
    status: 'paused',
    next_action_override: 'Add an interactive review TUI before publishing.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('rust-game')]: {
    status: 'idea',
    priority: 'C',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('data-pipeline')]: {
    status: 'active',
    priority: 'A',
    next_action_override:
      'Set up DDL-drift alert so the warehouse team gets paged before the next surprise.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('ml-experiment')]: {
    status: 'done',
    priority: 'B',
    note: 'Shipped LR baseline; closing experiment.',
    updated_at: new Date(NOW).toISOString(),
  },
  [id('old-bot')]: {
    status: 'abandoned',
    updated_at: new Date(NOW).toISOString(),
  },
};

fs.writeFileSync(
  path.join(OUT_DIR, 'index.json'),
  JSON.stringify(indexFile, null, 2),
);
fs.writeFileSync(
  path.join(OUT_DIR, 'overrides.json'),
  JSON.stringify(overrides, null, 2),
);

// Create the empty stub dirs the env vars point at, so the scanner finds them
// (and produces zero projects) without crashing on missing paths if rescan is hit.
fs.mkdirSync(path.join(OUT_DIR, '__none__'), { recursive: true });

console.log(`Demo data written to ${OUT_DIR}`);
console.log(`  - index.json     (${indexFile.projects.length} projects)`);
console.log(`  - overrides.json (${Object.keys(overrides).length} overrides)`);
console.log('');
console.log('Launch a demo server (separate from your live LaunchAgent):');
console.log('');
console.log(`  AICT_DATA_DIR=${OUT_DIR} \\`);
console.log(`  AICT_CLAUDE_PROJECTS_DIR=${OUT_DIR}/__none__ \\`);
console.log(`  AICT_CODEX_SESSIONS_DIR=${OUT_DIR}/__none__ \\`);
console.log('  npm run dev -- --port 5181');
console.log('');
console.log('Then open http://127.0.0.1:5181/');
console.log('');
console.log('NOTE: Clicking "Rescan" in the demo UI will WIPE this demo data');
console.log('      (the scanner will find zero sessions). Re-run this script');
console.log('      to regenerate.');
