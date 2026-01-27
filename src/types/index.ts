export interface Tab {
  id: string;
  title: string;
  filePath: string | null;
  content: string;
  isModified: boolean;
}

export interface HeadingItem {
  level: number;
  text: string;
  line: number;
  children: HeadingItem[];
  id: string;
}

export interface CursorPosition {
  line: number;
  col: number;
}

export interface SearchResult {
  total: number;
  current: number;
}

export interface EditorHandle {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  scrollToLine: (line: number) => void;
  wrapSelection: (before: string, after: string) => void;
  insertAtLineStart: (prefix: string) => void;
  insertText: (text: string) => void;
  getWordCount: () => number;
  // Search methods
  search: (query: string, caseSensitive?: boolean, useRegex?: boolean) => SearchResult;
  searchNext: () => void;
  searchPrev: () => void;
  replace: (replacement: string) => void;
  replaceAll: (replacement: string) => number;
  clearSearch: () => void;
  // Line editing
  replaceLineContent: (lineNumber: number, newContent: string) => void;
}
