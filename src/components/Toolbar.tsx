import { useStore } from '../store';

export function Toolbar() {
  const error = useStore((s) => s.error);
  if (!error) return null;
  return (
    <div className="bg-red-900/30 text-red-200 px-4 py-2 text-sm border-b border-red-800/60">
      {error}
    </div>
  );
}
