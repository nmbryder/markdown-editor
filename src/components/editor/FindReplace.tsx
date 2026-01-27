import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Replace, ReplaceAll } from 'lucide-react';
import clsx from 'clsx';
import { useEditorStore } from '../../store';
import type { SearchResult } from '../../types';
import styles from './FindReplace.module.css';

interface FindReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  showReplace?: boolean;
}

export function FindReplace({ isOpen, onClose, showReplace = false }: FindReplaceProps) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [result, setResult] = useState<SearchResult>({ total: 0, current: 0 });
  const [isReplaceVisible, setIsReplaceVisible] = useState(showReplace);

  const editorRef = useEditorStore((state) => state.editorRef);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  // Update replace visibility when prop changes
  useEffect(() => {
    setIsReplaceVisible(showReplace);
  }, [showReplace]);

  // Perform search when query or options change
  useEffect(() => {
    if (!editorRef || !isOpen) return;

    if (query) {
      const searchResult = editorRef.search(query, caseSensitive, useRegex);
      setResult(searchResult);
    } else {
      editorRef.clearSearch();
      setResult({ total: 0, current: 0 });
    }
  }, [query, caseSensitive, useRegex, editorRef, isOpen]);

  // Clear search when closed
  useEffect(() => {
    if (!isOpen && editorRef) {
      editorRef.clearSearch();
    }
  }, [isOpen, editorRef]);

  const handleClose = useCallback(() => {
    editorRef?.clearSearch();
    editorRef?.focus();
    onClose();
  }, [editorRef, onClose]);

  const handleNext = useCallback(() => {
    editorRef?.searchNext();
    if (result.total > 0) {
      setResult((prev) => ({
        ...prev,
        current: prev.current >= prev.total ? 1 : prev.current + 1,
      }));
    }
  }, [editorRef, result.total]);

  const handlePrev = useCallback(() => {
    editorRef?.searchPrev();
    if (result.total > 0) {
      setResult((prev) => ({
        ...prev,
        current: prev.current <= 1 ? prev.total : prev.current - 1,
      }));
    }
  }, [editorRef, result.total]);

  const handleReplace = useCallback(() => {
    if (!editorRef || result.total === 0) return;
    editorRef.replace(replacement);
    // Result will be updated by the search effect
  }, [editorRef, replacement, result.total]);

  const handleReplaceAll = useCallback(() => {
    if (!editorRef || result.total === 0) return;
    const count = editorRef.replaceAll(replacement);
    setResult({ total: 0, current: 0 });
    // Optionally show a notification about how many replacements were made
    console.log(`Replaced ${count} occurrences`);
  }, [editorRef, replacement, result.total]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          handlePrev();
        } else {
          handleNext();
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    },
    [handleClose, handleNext, handlePrev]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.container} onKeyDown={handleKeyDown}>
      <div className={styles.findRow}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Find"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.result}>
          {query ? `${result.current} of ${result.total}` : 'No results'}
        </div>
        <div className={styles.options}>
          <button
            className={clsx(styles.optionBtn, caseSensitive && styles.active)}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Match Case"
          >
            Aa
          </button>
          <button
            className={clsx(styles.optionBtn, useRegex && styles.active)}
            onClick={() => setUseRegex(!useRegex)}
            title="Use Regular Expression"
          >
            .*
          </button>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={handlePrev}
            disabled={result.total === 0}
            title="Previous Match (Shift+Enter)"
          >
            <ChevronUp size={16} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleNext}
            disabled={result.total === 0}
            title="Next Match (Enter)"
          >
            <ChevronDown size={16} />
          </button>
          <button
            className={clsx(styles.actionBtn, styles.toggleReplace)}
            onClick={() => setIsReplaceVisible(!isReplaceVisible)}
            title="Toggle Replace"
          >
            <Replace size={14} />
          </button>
          <button className={styles.closeBtn} onClick={handleClose} title="Close (Escape)">
            <X size={16} />
          </button>
        </div>
      </div>

      {isReplaceVisible && (
        <div className={styles.replaceRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="Replace"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleReplace();
              }
            }}
          />
          <div className={styles.replaceActions}>
            <button
              className={styles.actionBtn}
              onClick={handleReplace}
              disabled={result.total === 0}
              title="Replace"
            >
              <Replace size={14} />
            </button>
            <button
              className={styles.actionBtn}
              onClick={handleReplaceAll}
              disabled={result.total === 0}
              title="Replace All"
            >
              <ReplaceAll size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
