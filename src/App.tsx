import { useEffect } from 'react';
import { useStore } from './store';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { BulkBar } from './components/BulkBar';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { ShortcutHints } from './components/ShortcutHints';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export function App() {
  const load = useStore((s) => s.load);
  const loading = useStore((s) => s.loading);
  const index = useStore((s) => s.index);
  useKeyboardShortcuts();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="h-full flex bg-canvas">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Toolbar />
        <BulkBar />
        <div className="flex-1 flex overflow-hidden">
          {loading && !index ? <ListSkeleton /> : <ProjectList />}
          <ProjectDetail />
        </div>
      </main>
      <ShortcutHints />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex-1 overflow-hidden p-6 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-md bg-elev/40 border border-line animate-pulse"
          style={{ opacity: 1 - i * 0.08 }}
        />
      ))}
    </div>
  );
}
