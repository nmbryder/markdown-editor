import { open, save, confirm } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

export interface FileOperationResult {
  success: boolean;
  content?: string;
  filePath?: string;
  error?: string;
}

export async function exportContent(content: string, format: 'pdf' | 'docx'): Promise<void> {
  try {
    const extension = format;
    const filePath = await save({
      filters: [{ name: format.toUpperCase(), extensions: [extension] }],
      defaultPath: `untitled.${extension}`,
    });

    if (!filePath) return;

    if (format === 'pdf') {
      await invoke('export_pdf', { content, filePath });
    } else if (format === 'docx') {
      await invoke('export_docx', { content, filePath });
    }

    await confirm(`Exported successfully to ${filePath}`, { title: 'Export Complete', kind: 'info' });
  } catch (error) {
    console.error(`Error exporting to ${format}:`, error);
    await confirm(`Failed to export: ${String(error)}`, { title: 'Export Error', kind: 'error' });
  }
}

export async function openFile(): Promise<FileOperationResult> {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!selected) {
      return { success: false };
    }

    const filePath = selected as string;
    const content = await readTextFile(filePath);

    return {
      success: true,
      content,
      filePath,
    };
  } catch (error) {
    console.error('Error opening file:', error);
    return {
      success: false,
      error: String(error),
    };
  }
}

export async function saveFile(filePath: string, content: string): Promise<FileOperationResult> {
  try {
    await writeTextFile(filePath, content);
    return { success: true, filePath };
  } catch (error: unknown) {
    console.error('Error saving file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function saveFileAs(content: string): Promise<FileOperationResult> {
  try {
    const filePath = await save({
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      defaultPath: 'untitled.md',
    });

    if (!filePath) {
      return { success: false };
    }

    await writeTextFile(filePath, content);

    return {
      success: true,
      filePath,
    };
  } catch (error: unknown) {
    console.error('Error saving file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function confirmDiscardChanges(fileName: string): Promise<boolean> {
  const result = await confirm(
    `"${fileName}" has unsaved changes. Do you want to discard them?`,
    {
      title: 'Unsaved Changes',
      kind: 'warning',
    }
  );
  return result;
}

export function getFileName(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || 'Untitled';
}
