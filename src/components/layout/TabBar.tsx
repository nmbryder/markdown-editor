import { X, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useTabStore } from '../../store';
import { IconButton } from '../ui';
import styles from './TabBar.module.css';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, createTab } = useTabStore();

  return (
    <nav className={styles.tabBar}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={clsx(styles.tab, tab.id === activeTabId && styles.active)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.isModified && <span className={styles.modified} />}
            <span className={styles.title}>{tab.title}</span>
            <button
              className={styles.close}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <IconButton size="sm" onClick={() => createTab()} title="New Tab">
        <Plus size={16} />
      </IconButton>
    </nav>
  );
}
