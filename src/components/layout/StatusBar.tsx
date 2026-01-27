import { useTabStore, useEditorStore } from '../../store';
import { getFileName } from '../../utils/fileOps';
import styles from './StatusBar.module.css';

export function StatusBar() {
  const activeTab = useTabStore((state) => {
    const id = state.activeTabId;
    return state.tabs.find((t) => t.id === id) || null;
  });
  const { cursorPosition, wordCount } = useEditorStore();

  const fileName = activeTab?.filePath
    ? getFileName(activeTab.filePath)
    : 'Untitled';

  return (
    <footer className={styles.statusBar}>
      <span className={styles.file}>{fileName}</span>
      {activeTab?.isModified && (
        <span className={styles.modified}>(modified)</span>
      )}
      <span className={styles.spacer} />
      <span className={styles.cursor}>
        Ln {cursorPosition.line}, Col {cursorPosition.col}
      </span>
      <span className={styles.words}>
        {wordCount} word{wordCount !== 1 ? 's' : ''}
      </span>
    </footer>
  );
}
