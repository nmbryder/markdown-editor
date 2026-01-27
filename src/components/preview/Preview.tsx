import { useMemo } from 'react';
import { useTabStore } from '../../store';
import { renderMarkdown } from '../../utils/markdown';
import styles from './Preview.module.css';

export function Preview() {
  const activeTab = useTabStore((state) => {
    const id = state.activeTabId;
    return state.tabs.find((t) => t.id === id) || null;
  });

  const html = useMemo(() => {
    if (!activeTab?.content) return '';
    return renderMarkdown(activeTab.content);
  }, [activeTab?.content]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Preview</span>
      </div>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
