import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { handle } from './server/api';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ai-coding-tracker-api',
      configureServer(server) {
        // Safety net for an always-on local server: transient filesystem read
        // errors (e.g. errno -11 / EDEADLK during Spotlight reindexing) have
        // previously surfaced as uncaught stream 'error' events and killed the
        // whole process, leaving the UI showing "Failed to fetch". Log and keep
        // running instead of crashing.
        process.on('uncaughtException', (err) => {
          console.error('[ai-coding-tracker] uncaughtException (ignored):', err);
        });
        process.on('unhandledRejection', (reason) => {
          console.error('[ai-coding-tracker] unhandledRejection (ignored):', reason);
        });
        server.middlewares.use(async (req, res, next) => {
          const handled = await handle(req, res);
          if (!handled) next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: false,
  },
});
