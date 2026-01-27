import {
  FilePlus,
  FolderOpen,
  Save,
  Bold,
  Italic,
  Code,
  Link,
  Heading,
  List,
  Quote,
  Moon,
  Sun,
  PanelLeft,
  Download,
} from 'lucide-react';
import { useUIStore, useEditorStore, useTabStore } from '../../store';
import { useFileOperations } from '../../hooks';
import { exportContent } from '../../utils/fileOps';
import { IconButton, Dropdown } from '../ui';
import styles from './Toolbar.module.css';

export function Toolbar() {
  const { theme, toggleTheme, toggleOutline } = useUIStore();
  const { applyBold, applyItalic, applyCode, applyLink, applyHeading, applyList, applyQuote, editorRef } =
    useEditorStore();
  const { handleNew, handleOpen, handleSave } = useFileOperations();

  const activeTab = useTabStore((state) => {
    const id = state.activeTabId;
    return state.tabs.find((t) => t.id === id) || null;
  });

  const handleExportHTML = () => {
    if (!activeTab) return;
    const previewEl = document.querySelector('[class*="Preview_content"]');
    if (!previewEl) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeTab.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
${previewEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab.title.replace(/\.[^/.]+$/, '')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!editorRef) return;
    const content = editorRef.getContent();
    await exportContent(content, 'pdf');
  };

  const handleExportDOCX = async () => {
    if (!editorRef) return;
    const content = editorRef.getContent();
    await exportContent(content, 'docx');
  };

  const exportItems = [
    { label: 'Export as PDF', onClick: handleExportPDF },
    { label: 'Export as DOCX', onClick: handleExportDOCX },
    { label: 'Export as HTML', onClick: handleExportHTML },
  ];

  return (
    <header className={styles.toolbar}>
      <div className={styles.group}>
        <IconButton onClick={handleNew} title="New File (Ctrl+N)">
          <FilePlus size={18} />
        </IconButton>
        <IconButton onClick={handleOpen} title="Open File (Ctrl+O)">
          <FolderOpen size={18} />
        </IconButton>
        <IconButton onClick={handleSave} title="Save File (Ctrl+S)">
          <Save size={18} />
        </IconButton>
      </div>

      <div className={styles.separator} />

      <div className={styles.group}>
        <IconButton onClick={applyBold} title="Bold (Ctrl+B)">
          <Bold size={18} />
        </IconButton>
        <IconButton onClick={applyItalic} title="Italic (Ctrl+I)">
          <Italic size={18} />
        </IconButton>
        <IconButton onClick={applyCode} title="Inline Code (Ctrl+`)">
          <Code size={18} />
        </IconButton>
        <IconButton onClick={applyLink} title="Link (Ctrl+K)">
          <Link size={18} />
        </IconButton>
        <IconButton onClick={applyHeading} title="Heading">
          <Heading size={18} />
        </IconButton>
        <IconButton onClick={applyList} title="Bullet List">
          <List size={18} />
        </IconButton>
        <IconButton onClick={applyQuote} title="Blockquote">
          <Quote size={18} />
        </IconButton>
      </div>

      <div className={styles.spacer} />

      <div className={styles.group}>
        <IconButton onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
        <IconButton onClick={toggleOutline} title="Toggle Outline">
          <PanelLeft size={18} />
        </IconButton>
        <Dropdown
          trigger={
            <IconButton title="Export">
              <Download size={18} />
            </IconButton>
          }
          items={exportItems}
        />
      </div>
    </header>
  );
}
