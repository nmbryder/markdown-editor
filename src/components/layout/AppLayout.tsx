import { useEffect, useRef } from 'react';
import { useUIStore, useTabStore } from '../../store';
import { useKeyboardShortcuts, useFileOperations } from '../../hooks';
import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { StatusBar } from './StatusBar';
import { ResizeHandle } from './ResizeHandle';
import { Editor } from '../editor/Editor';
import { Preview } from '../preview/Preview';
import { Outline } from '../outline/Outline';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { editorPanelWidth, setEditorPanelWidth, theme, setTheme, viewMode } = useUIStore();
  const { tabs, createTab } = useTabStore();
  const { handleNew, handleOpen, handleSave } = useFileOperations();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Create initial tab if none exist
  useEffect(() => {
    if (tabs.length === 0) {
      createTab();
    }
  }, [tabs.length, createTab]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onNew: handleNew,
    onOpen: handleOpen,
    onSave: handleSave,
  });

  // Handle resize
  const handleResizeMouseDown = () => {
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !mainContentRef.current || viewMode !== 'split') return;

      const rect = mainContentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      setEditorPanelWidth(percent);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setEditorPanelWidth, viewMode]);

  useEffect(() => {
    if (viewMode === 'split') return;
    isResizingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [viewMode]);

  const showEditor = viewMode !== 'preview';
  const showPreview = viewMode !== 'editor';
  const isSplit = viewMode === 'split';

  return (
    <div className={styles.app}>
      <Toolbar />
      <TabBar />
      <main ref={mainContentRef} className={styles.mainContent}>
        <Outline />
        {showEditor && (
          <div
            className={styles.editorPanel}
            style={{ flex: isSplit ? `0 0 ${editorPanelWidth}%` : '1 1 auto' }}
          >
            <Editor />
          </div>
        )}
        {isSplit && <ResizeHandle onMouseDown={handleResizeMouseDown} />}
        {showPreview && (
          <div
            className={styles.previewPanel}
            style={{ flex: isSplit ? `0 0 ${100 - editorPanelWidth - 0.5}%` : '1 1 auto' }}
          >
            <Preview />
          </div>
        )}
      </main>
      <StatusBar />
    </div>
  );
}
