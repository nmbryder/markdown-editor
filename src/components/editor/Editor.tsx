import { useEffect, useCallback, useState } from 'react';
import { useCodeMirror } from '../../hooks/useCodeMirror';
import { useEditorStore, useTabStore } from '../../store';
import { countWords } from '../../utils/markdown';
import { FindReplace } from './FindReplace';
import styles from './Editor.module.css';

export function Editor() {
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  const activeTab = useTabStore((state) => {
    const id = state.activeTabId;
    return state.tabs.find((t) => t.id === id) || null;
  });
  const updateTabContent = useTabStore((state) => state.updateTabContent);
  const { setCursorPosition, setWordCount, setEditorRef } = useEditorStore();

  const handleChange = useCallback(
    (content: string) => {
      if (activeTab) {
        updateTabContent(activeTab.id, content);
        setWordCount(countWords(content));
      }
    },
    [activeTab, updateTabContent, setWordCount]
  );

  const handleCursorChange = useCallback(
    (line: number, col: number) => {
      setCursorPosition(line, col);
    },
    [setCursorPosition]
  );

  const { containerRef, editorHandle } = useCodeMirror({
    initialContent: activeTab?.content || '',
    onChange: handleChange,
    onCursorChange: handleCursorChange,
  });

  // Register editor handle with store
  useEffect(() => {
    setEditorRef(editorHandle);
    return () => setEditorRef(null);
  }, [editorHandle, setEditorRef]);

  // Sync content when active tab changes
  useEffect(() => {
    if (activeTab) {
      editorHandle.setContent(activeTab.content);
      setWordCount(countWords(activeTab.content));
    }
  }, [activeTab?.id]); // Only when tab ID changes

  // Keyboard shortcuts for Find/Replace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowReplace(false);
        setIsFindOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowReplace(true);
        setIsFindOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCloseFindReplace = useCallback(() => {
    setIsFindOpen(false);
  }, []);

  return (
    <div className={styles.editorWrapper}>
      <FindReplace isOpen={isFindOpen} onClose={handleCloseFindReplace} showReplace={showReplace} />
      <div ref={containerRef} className={styles.editor} />
    </div>
  );
}
