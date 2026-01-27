import { create } from 'zustand';
import type { Tab } from '../types';
import { confirmDiscardChanges } from '../utils/fileOps';

interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;
  tabCounter: number;

  createTab: (title?: string, filePath?: string | null, content?: string) => Tab;
  closeTab: (id: string) => Promise<void>;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  markTabSaved: (id: string, filePath?: string | null, title?: string | null) => void;
  getActiveTab: () => Tab | null;
  getTabByFilePath: (filePath: string) => Tab | null;
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  tabCounter: 0,

  createTab: (title = 'Untitled', filePath = null, content = '') => {
    const id = `tab-${get().tabCounter + 1}`;
    const tab: Tab = {
      id,
      title,
      filePath,
      content,
      isModified: false,
    };

    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: id,
      tabCounter: state.tabCounter + 1,
    }));

    return tab;
  },

  closeTab: async (id: string) => {
    const { tabs, activeTabId, createTab } = get();
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;

    // Ask for confirmation if modified
    if (tab.isModified) {
      const shouldClose = await confirmDiscardChanges(tab.title);
      if (!shouldClose) return;
    }

    const newTabs = tabs.filter((t) => t.id !== id);

    // If this was the active tab, switch to another
    let newActiveId = activeTabId;
    if (activeTabId === id) {
      if (newTabs.length > 0) {
        newActiveId = newTabs[newTabs.length - 1].id;
      } else {
        // Create a new empty tab if no tabs remain
        set({ tabs: newTabs, activeTabId: null });
        createTab();
        return;
      }
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (tab) {
      set({ activeTabId: id });
    }
  },

  updateTabContent: (id: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, content, isModified: tab.content !== content || tab.isModified }
          : tab
      ),
    }));
  },

  markTabSaved: (id: string, filePath: string | null = null, title: string | null = null) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              isModified: false,
              filePath: filePath !== null ? filePath : tab.filePath,
              title: title !== null ? title : tab.title,
            }
          : tab
      ),
    }));
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId) || null;
  },

  getTabByFilePath: (filePath: string) => {
    return get().tabs.find((t) => t.filePath === filePath) || null;
  },
}));
