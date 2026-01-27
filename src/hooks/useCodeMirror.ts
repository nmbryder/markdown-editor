import { useEffect, useRef, useCallback, useMemo } from 'react';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from '@codemirror/language';
import type { EditorHandle, SearchResult } from '../types';

// Search state stored outside React for CodeMirror access
interface SearchState {
  query: string;
  caseSensitive: boolean;
  useRegex: boolean;
  matches: { from: number; to: number }[];
  currentIndex: number;
}

const searchStateRef: { current: SearchState | null } = { current: null };

// Search highlight decoration
const searchHighlight = Decoration.mark({ class: 'cm-searchMatch' });
const currentSearchHighlight = Decoration.mark({ class: 'cm-searchMatch-current' });

function getSearchDecorations(_view: EditorView): DecorationSet {
  const state = searchStateRef.current;
  if (!state || state.matches.length === 0) {
    return Decoration.none;
  }

  const decorations = state.matches.map((match, index) => {
    const deco = index === state.currentIndex ? currentSearchHighlight : searchHighlight;
    return deco.range(match.from, match.to);
  });

  return Decoration.set(decorations, true);
}

const searchHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = getSearchDecorations(view);
    }

    update(update: ViewUpdate) {
      this.decorations = getSearchDecorations(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// Custom theme for search highlights
const searchTheme = EditorView.baseTheme({
  '.cm-searchMatch': {
    backgroundColor: 'rgba(255, 213, 0, 0.4)',
    borderRadius: '2px',
  },
  '.cm-searchMatch-current': {
    backgroundColor: 'rgba(255, 150, 0, 0.6)',
    borderRadius: '2px',
  },
});

interface UseCodeMirrorOptions {
  initialContent: string;
  onChange: (content: string) => void;
  onCursorChange: (line: number, col: number) => void;
}

export function useCodeMirror(options: UseCodeMirrorOptions): {
  containerRef: React.RefObject<HTMLDivElement>;
  editorHandle: EditorHandle;
} {
  const containerRef = useRef<HTMLDivElement>(null!);
  const viewRef = useRef<EditorView | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        optionsRef.current.onChange(update.state.doc.toString());
      }
      if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        optionsRef.current.onCursorChange(line.number, pos - line.from + 1);
      }
    });

    const view = new EditorView({
      state: EditorState.create({
        doc: options.initialContent,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          bracketMatching(),
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          syntaxHighlighting(defaultHighlightStyle),
          oneDark,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          updateListener,
          EditorView.lineWrapping,
          searchHighlightPlugin,
          searchTheme,
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContent = useCallback((): string => {
    return viewRef.current?.state.doc.toString() || '';
  }, []);

  const setContent = useCallback((content: string) => {
    if (!viewRef.current) return;
    const currentContent = viewRef.current.state.doc.toString();
    if (currentContent === content) return;

    viewRef.current.dispatch({
      changes: {
        from: 0,
        to: viewRef.current.state.doc.length,
        insert: content,
      },
    });
  }, []);

  const focus = useCallback(() => {
    viewRef.current?.focus();
  }, []);

  const scrollToLine = useCallback((lineNumber: number) => {
    if (!viewRef.current) return;
    const doc = viewRef.current.state.doc;
    const line = doc.line(Math.min(lineNumber, doc.lines));
    viewRef.current.dispatch({
      selection: { anchor: line.from, head: line.from },
      scrollIntoView: true,
    });
    viewRef.current.focus();
  }, []);

  const wrapSelection = useCallback((before: string, after: string) => {
    if (!viewRef.current) return;
    const { from, to } = viewRef.current.state.selection.main;
    const selectedText = viewRef.current.state.sliceDoc(from, to);

    viewRef.current.dispatch({
      changes: {
        from,
        to,
        insert: before + selectedText + after,
      },
      selection: {
        anchor: from + before.length,
        head: to + before.length,
      },
    });
    viewRef.current.focus();
  }, []);

  const insertAtLineStart = useCallback((prefix: string) => {
    if (!viewRef.current) return;
    const { from } = viewRef.current.state.selection.main;
    const line = viewRef.current.state.doc.lineAt(from);

    viewRef.current.dispatch({
      changes: {
        from: line.from,
        to: line.from,
        insert: prefix,
      },
    });
    viewRef.current.focus();
  }, []);

  const insertText = useCallback((text: string) => {
    if (!viewRef.current) return;
    const { from, to } = viewRef.current.state.selection.main;

    viewRef.current.dispatch({
      changes: {
        from,
        to,
        insert: text,
      },
    });
    viewRef.current.focus();
  }, []);

  const getWordCount = useCallback((): number => {
    if (!viewRef.current) return 0;
    const text = viewRef.current.state.doc.toString();
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    return words.length;
  }, []);

  // Search functionality
  const search = useCallback((query: string, caseSensitive = false, useRegex = false): SearchResult => {
    if (!viewRef.current || !query) {
      searchStateRef.current = null;
      viewRef.current?.dispatch({}); // Trigger decoration update
      return { total: 0, current: 0 };
    }

    const content = viewRef.current.state.doc.toString();
    const matches: { from: number; to: number }[] = [];

    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(query, flags);
        let match;
        while ((match = regex.exec(content)) !== null) {
          matches.push({ from: match.index, to: match.index + match[0].length });
          if (match[0].length === 0) regex.lastIndex++; // Prevent infinite loop on zero-width matches
        }
      } else {
        const searchContent = caseSensitive ? content : content.toLowerCase();
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        let pos = 0;
        while ((pos = searchContent.indexOf(searchQuery, pos)) !== -1) {
          matches.push({ from: pos, to: pos + query.length });
          pos += query.length;
        }
      }
    } catch {
      // Invalid regex, return no matches
      searchStateRef.current = null;
      viewRef.current?.dispatch({});
      return { total: 0, current: 0 };
    }

    // Find the match closest to current cursor position
    const cursorPos = viewRef.current.state.selection.main.head;
    let currentIndex = 0;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].from >= cursorPos) {
        currentIndex = i;
        break;
      }
      currentIndex = i;
    }

    searchStateRef.current = {
      query,
      caseSensitive,
      useRegex,
      matches,
      currentIndex: matches.length > 0 ? currentIndex : -1,
    };

    // Scroll to current match
    if (matches.length > 0) {
      const match = matches[currentIndex];
      viewRef.current.dispatch({
        selection: { anchor: match.from, head: match.to },
        scrollIntoView: true,
      });
    } else {
      viewRef.current.dispatch({}); // Trigger decoration update
    }

    return { total: matches.length, current: matches.length > 0 ? currentIndex + 1 : 0 };
  }, []);

  const searchNext = useCallback(() => {
    const state = searchStateRef.current;
    if (!viewRef.current || !state || state.matches.length === 0) return;

    state.currentIndex = (state.currentIndex + 1) % state.matches.length;
    const match = state.matches[state.currentIndex];

    viewRef.current.dispatch({
      selection: { anchor: match.from, head: match.to },
      scrollIntoView: true,
    });
  }, []);

  const searchPrev = useCallback(() => {
    const state = searchStateRef.current;
    if (!viewRef.current || !state || state.matches.length === 0) return;

    state.currentIndex = (state.currentIndex - 1 + state.matches.length) % state.matches.length;
    const match = state.matches[state.currentIndex];

    viewRef.current.dispatch({
      selection: { anchor: match.from, head: match.to },
      scrollIntoView: true,
    });
  }, []);

  const replace = useCallback((replacement: string) => {
    const state = searchStateRef.current;
    if (!viewRef.current || !state || state.matches.length === 0 || state.currentIndex < 0) return;

    const match = state.matches[state.currentIndex];
    viewRef.current.dispatch({
      changes: { from: match.from, to: match.to, insert: replacement },
    });

    // Re-search to update matches
    setTimeout(() => {
      search(state.query, state.caseSensitive, state.useRegex);
    }, 0);
  }, [search]);

  const replaceAll = useCallback((replacement: string): number => {
    const state = searchStateRef.current;
    if (!viewRef.current || !state || state.matches.length === 0) return 0;

    const count = state.matches.length;

    // Apply replacements from end to start to preserve positions
    const changes = [...state.matches]
      .reverse()
      .map((match) => ({ from: match.from, to: match.to, insert: replacement }));

    viewRef.current.dispatch({ changes });

    // Clear search state
    searchStateRef.current = null;
    viewRef.current.dispatch({});

    return count;
  }, []);

  const clearSearch = useCallback(() => {
    searchStateRef.current = null;
    viewRef.current?.dispatch({});
  }, []);

  const replaceLineContent = useCallback((lineNumber: number, newContent: string) => {
    if (!viewRef.current) return;
    const doc = viewRef.current.state.doc;
    if (lineNumber < 1 || lineNumber > doc.lines) return;

    const line = doc.line(lineNumber);
    viewRef.current.dispatch({
      changes: { from: line.from, to: line.to, insert: newContent },
    });
  }, []);

  const editorHandle: EditorHandle = useMemo(
    () => ({
      getContent,
      setContent,
      focus,
      scrollToLine,
      wrapSelection,
      insertAtLineStart,
      insertText,
      getWordCount,
      search,
      searchNext,
      searchPrev,
      replace,
      replaceAll,
      clearSearch,
      replaceLineContent,
    }),
    [
      getContent,
      setContent,
      focus,
      scrollToLine,
      wrapSelection,
      insertAtLineStart,
      insertText,
      getWordCount,
      search,
      searchNext,
      searchPrev,
      replace,
      replaceAll,
      clearSearch,
      replaceLineContent,
    ]
  );

  return { containerRef, editorHandle };
}
