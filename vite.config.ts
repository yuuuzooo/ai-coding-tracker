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
