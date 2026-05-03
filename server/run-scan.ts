import { scan } from './scanner.js';
import { INDEX_FILE } from './paths.js';

scan()
  .then((f) => {
    const cc = f.projects.filter((p) => p.source === 'claude-code').length;
    const cx = f.projects.filter((p) => p.source === 'codex').length;
    console.log(
      `[scanner] wrote ${INDEX_FILE} — ${f.projects.length} projects (claude-code: ${cc}, codex: ${cx})`,
    );
  })
  .catch((err) => {
    console.error('[scanner] failed:', err);
    process.exit(1);
  });
