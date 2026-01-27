import { useEffect } from 'react';
import { useEditorStore } from '../store';

interface KeyboardShortcutHandlers {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const { applyBold, applyItalic, applyCode, applyLink } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyBold();
          break;
        case 'i':
          e.preventDefault();
          applyItalic();
          break;
        case 'k':
          e.preventDefault();
          applyLink();
          break;
        case 'n':
          e.preventDefault();
          handlers.onNew();
          break;
        case 'o':
          e.preventDefault();
          handlers.onOpen();
          break;
        case 's':
          e.preventDefault();
          handlers.onSave();
          break;
        case '`':
          e.preventDefault();
          applyCode();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [applyBold, applyItalic, applyCode, applyLink, handlers]);
}
