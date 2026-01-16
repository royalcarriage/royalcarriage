import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  handler: () => void;
  description: string;
}

const SHORTCUTS: Record<string, KeyboardShortcut> = {
  '/': {
    key: '/',
    handler: () => {}, // Handled by GlobalSearch component
    description: 'Focus global search',
  },
  'g+o': {
    key: 'g+o',
    handler: () => window.location.href = '/admin',
    description: 'Go to Overview',
  },
  'g+i': {
    key: 'g+i',
    handler: () => window.location.href = '/admin/imports',
    description: 'Go to Imports',
  },
  'g+s': {
    key: 'g+s',
    handler: () => window.location.href = '/admin/seo',
    description: 'Go to SEO Bot',
  },
  'g+r': {
    key: 'g+r',
    handler: () => window.location.href = '/admin/roi',
    description: 'Go to ROI',
  },
  'g+d': {
    key: 'g+d',
    handler: () => window.location.href = '/admin/deploy',
    description: 'Go to Deploy',
  },
};

export function useKeyboardShortcuts() {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Handle Escape
    if (event.key === 'Escape') {
      // Close modals/dropdowns - let components handle this
      return;
    }

    // Handle 'g' sequences
    if (event.key === 'g') {
      const nextKey = await new Promise<string>((resolve) => {
        const handler = (e: KeyboardEvent) => {
          window.removeEventListener('keydown', handler);
          resolve(e.key);
        };
        window.addEventListener('keydown', handler);
        setTimeout(() => {
          window.removeEventListener('keydown', handler);
          resolve('');
        }, 1000); // 1 second timeout for sequence
      });

      const shortcutKey = `g+${nextKey}`;
      const shortcut = SHORTCUTS[shortcutKey];
      if (shortcut) {
        event.preventDefault();
        shortcut.handler();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return { shortcuts: SHORTCUTS };
}

// Helper hook to display keyboard shortcuts in UI
export function useShortcutsList() {
  return Object.values(SHORTCUTS).map(s => ({
    keys: s.key.split('+'),
    description: s.description,
  }));
}
