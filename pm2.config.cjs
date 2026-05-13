// PM2 ecosystem file for running ai-coding-tracker as a background service.
// Works on macOS / Linux / Windows. Useful when you don't want LaunchAgent or systemd.
//
// Quick start:
//   npm install -g pm2
//   pm2 start pm2.config.cjs
//
// Enable auto-start at boot:
//   pm2 save                                  # remember currently-running apps
//   pm2 startup                               # macOS / Linux: prints a command, copy & paste it
//   # On Windows you also need a one-time bootstrap so PM2 launches at login:
//   #   npm install -g pm2-windows-startup
//   #   pm2-startup install
//
// Useful commands:
//   pm2 status
//   pm2 logs ai-coding-tracker
//   pm2 restart ai-coding-tracker
//   pm2 stop ai-coding-tracker
//   pm2 delete ai-coding-tracker

module.exports = {
  apps: [
    {
      name: 'ai-coding-tracker',
      script: 'npm',
      args: ['run', 'dev', '--', '--port', '5180', '--strictPort'],
      // Run from the repo root regardless of where `pm2 start` is invoked.
      cwd: __dirname,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Use the parent process's env (PATH must contain node/npm). On Windows,
      // PATH typically works out of the box because pm2 is installed globally.
      env: {
        NODE_ENV: 'development',
      },
      // Override these via environment variables if your Claude Code / Codex
      // history lives in non-default locations (e.g. WSL pointing at the
      // Windows-side .claude directory).
      //   env: {
      //     AICT_CLAUDE_PROJECTS_DIR: '/mnt/c/Users/<you>/.claude/projects',
      //   }
    },
  ],
};
