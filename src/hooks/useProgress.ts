import { useEffect } from 'react';
import { useProgressStore } from '../stores/progressStore';

export function useProgress() {
  const setPercent = useProgressStore((state) => state.setPercent);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
      setPercent(scrollPercent || 0);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, [setPercent]);
}
