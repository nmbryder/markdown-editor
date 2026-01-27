import { useCallback, useRef, useEffect } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (width: number) => void;
}

export function useResizable({
  initialWidth,
  minWidth = 20,
  maxWidth = 80,
  onResize,
}: UseResizableOptions) {
  const isResizingRef = useRef(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleMouseDown = useCallback(() => {
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const totalWidth = containerRect.width;

      let percent = (x / totalWidth) * 100;
      percent = Math.max(minWidth, Math.min(maxWidth, percent));

      onResize(percent);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth, maxWidth, onResize]);

  return {
    handleMouseDown,
    containerRef,
    width: initialWidth,
  };
}
