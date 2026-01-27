import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIStore {
  theme: Theme;
  isOutlineVisible: boolean;
  editorPanelWidth: number; // percentage

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleOutline: () => void;
  setOutlineVisible: (visible: boolean) => void;
  setEditorPanelWidth: (width: number) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      isOutlineVisible: false,
      editorPanelWidth: 50,

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        set({ theme: newTheme });
      },

      setTheme: (theme: Theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      toggleOutline: () => {
        set((state) => ({ isOutlineVisible: !state.isOutlineVisible }));
      },

      setOutlineVisible: (visible: boolean) => {
        set({ isOutlineVisible: visible });
      },

      setEditorPanelWidth: (width: number) => {
        // Clamp between 20% and 80%
        const clampedWidth = Math.max(20, Math.min(80, width));
        set({ editorPanelWidth: clampedWidth });
      },
    }),
    {
      name: 'markdown-editor-ui',
      partialize: (state) => ({
        theme: state.theme,
        isOutlineVisible: state.isOutlineVisible,
        editorPanelWidth: state.editorPanelWidth,
      }),
    }
  )
);
