import { create } from 'zustand';
import type { CursorPosition, EditorHandle } from '../types';

interface EditorStore {
  cursorPosition: CursorPosition;
  wordCount: number;
  editorRef: EditorHandle | null;

  setCursorPosition: (line: number, col: number) => void;
  setWordCount: (count: number) => void;
  setEditorRef: (ref: EditorHandle | null) => void;

  // Formatting actions (delegate to editor ref)
  applyBold: () => void;
  applyItalic: () => void;
  applyCode: () => void;
  applyLink: () => void;
  applyHeading: () => void;
  applyList: () => void;
  applyQuote: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  cursorPosition: { line: 1, col: 1 },
  wordCount: 0,
  editorRef: null,

  setCursorPosition: (line: number, col: number) => {
    set({ cursorPosition: { line, col } });
  },

  setWordCount: (count: number) => {
    set({ wordCount: count });
  },

  setEditorRef: (ref: EditorHandle | null) => {
    set({ editorRef: ref });
  },

  applyBold: () => {
    get().editorRef?.wrapSelection('**', '**');
  },

  applyItalic: () => {
    get().editorRef?.wrapSelection('*', '*');
  },

  applyCode: () => {
    get().editorRef?.wrapSelection('`', '`');
  },

  applyLink: () => {
    get().editorRef?.wrapSelection('[', '](url)');
  },

  applyHeading: () => {
    get().editorRef?.insertAtLineStart('## ');
  },

  applyList: () => {
    get().editorRef?.insertAtLineStart('- ');
  },

  applyQuote: () => {
    get().editorRef?.insertAtLineStart('> ');
  },
}));
