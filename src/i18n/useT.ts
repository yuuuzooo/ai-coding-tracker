import { useStore } from '../store';
import { STRINGS, type Strings } from './strings';

export function useT(): Strings {
  const lang = useStore((s) => s.lang);
  return STRINGS[lang];
}
