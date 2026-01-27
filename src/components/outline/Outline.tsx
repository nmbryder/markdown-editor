import { useMemo, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useTabStore, useEditorStore, useUIStore } from '../../store';
import { extractHeadings } from '../../utils/markdown';
import { IconButton } from '../ui';
import type { HeadingItem } from '../../types';
import styles from './Outline.module.css';

export function Outline() {
  const activeTab = useTabStore((state) => {
    const id = state.activeTabId;
    return state.tabs.find((t) => t.id === id) || null;
  });
  const editorRef = useEditorStore((state) => state.editorRef);
  const { isOutlineVisible, toggleOutline } = useUIStore();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const headings = useMemo(() => {
    if (!activeTab?.content) return [];
    return extractHeadings(activeTab.content);
  }, [activeTab?.content]);

  const handleHeadingClick = useCallback(
    (line: number) => {
      editorRef?.scrollToLine(line);
    },
    [editorRef]
  );

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (!isOutlineVisible) return null;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span>Outline</span>
        <IconButton size="sm" onClick={toggleOutline} title="Close">
          <X size={14} />
        </IconButton>
      </div>
      <div className={styles.content}>
        {headings.length === 0 ? (
          <div className={styles.empty}>No headings found</div>
        ) : (
          <OutlineTree
            items={headings}
            collapsedIds={collapsedIds}
            onToggleCollapse={toggleCollapse}
            onHeadingClick={handleHeadingClick}
          />
        )}
      </div>
    </aside>
  );
}

interface OutlineTreeProps {
  items: HeadingItem[];
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onHeadingClick: (line: number) => void;
}

function OutlineTree({
  items,
  collapsedIds,
  onToggleCollapse,
  onHeadingClick,
}: OutlineTreeProps) {
  return (
    <>
      {items.map((item) => (
        <OutlineNode
          key={item.id}
          item={item}
          collapsedIds={collapsedIds}
          onToggleCollapse={onToggleCollapse}
          onHeadingClick={onHeadingClick}
        />
      ))}
    </>
  );
}

interface OutlineNodeProps {
  item: HeadingItem;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onHeadingClick: (line: number) => void;
}

function OutlineNode({
  item,
  collapsedIds,
  onToggleCollapse,
  onHeadingClick,
}: OutlineNodeProps) {
  const isCollapsed = collapsedIds.has(item.id);
  const hasChildren = item.children.length > 0;

  return (
    <div className={styles.node}>
      <div
        className={clsx(styles.item, styles[`level${item.level}`])}
        onClick={() => onHeadingClick(item.line)}
      >
        <span
          className={clsx(styles.toggle, hasChildren && styles.hasChildren)}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleCollapse(item.id);
          }}
        >
          {hasChildren &&
            (isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />)}
        </span>
        <span className={styles.text}>{item.text}</span>
      </div>
      {hasChildren && !isCollapsed && (
        <div className={styles.children}>
          <OutlineTree
            items={item.children}
            collapsedIds={collapsedIds}
            onToggleCollapse={onToggleCollapse}
            onHeadingClick={onHeadingClick}
          />
        </div>
      )}
    </div>
  );
}
