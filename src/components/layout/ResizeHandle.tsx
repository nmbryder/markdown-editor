import styles from './ResizeHandle.module.css';

interface ResizeHandleProps {
  onMouseDown: () => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return <div className={styles.handle} onMouseDown={onMouseDown} />;
}
