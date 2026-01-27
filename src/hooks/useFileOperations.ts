import { useCallback } from 'react';
import { useTabStore, useEditorStore } from '../store';
import { openFile, saveFile, saveFileAs, getFileName } from '../utils/fileOps';

export function useFileOperations() {
  const { createTab, getActiveTab, markTabSaved, getTabByFilePath, setActiveTab } = useTabStore();
  const editorRef = useEditorStore((state) => state.editorRef);

  const handleNew = useCallback(() => {
    createTab();
  }, [createTab]);

  const handleOpen = useCallback(async () => {
    const result = await openFile();
    if (!result.success || !result.content || !result.filePath) return;

    // Check if already open
    const existingTab = getTabByFilePath(result.filePath);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const fileName = getFileName(result.filePath);
    const tab = createTab(fileName, result.filePath, result.content);
    markTabSaved(tab.id);
  }, [createTab, getTabByFilePath, markTabSaved, setActiveTab]);

  const handleSave = useCallback(async () => {
    const activeTab = getActiveTab();
    if (!activeTab || !editorRef) return;

    const content = editorRef.getContent();

    if (activeTab.filePath) {
      const result = await saveFile(activeTab.filePath, content);
      if (result.success) {
        markTabSaved(activeTab.id);
      } else {
        alert(`Failed to save file: ${result.error || 'Unknown error'}`);
      }
    } else {
      const result = await saveFileAs(content);
      if (result.success && result.filePath) {
        const fileName = getFileName(result.filePath);
        markTabSaved(activeTab.id, result.filePath, fileName);
      } else if (result.error) {
        alert(`Failed to save file: ${result.error}`);
      }
    }
  }, [getActiveTab, editorRef, markTabSaved]);

  return { handleNew, handleOpen, handleSave };
}
