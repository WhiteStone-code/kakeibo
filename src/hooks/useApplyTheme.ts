import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useApplyTheme() {
  const theme = useStore((s) => s.settings.theme);
  const mode = useStore((s) => s.settings.mode);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    if (mode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme, mode]);
}
