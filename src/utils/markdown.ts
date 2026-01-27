import { marked } from 'marked';
import hljs from 'highlight.js';
import type { HeadingItem } from '../types';

// Configure marked for syntax highlighting
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer for code blocks with syntax highlighting
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch {
      // Fall through to default
    }
  }
  return `<pre><code>${text}</code></pre>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  try {
    return marked.parse(content) as string;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return '<p style="color: var(--error);">Error rendering markdown</p>';
  }
}

export function extractHeadings(content: string): HeadingItem[] {
  const flatHeadings: Omit<HeadingItem, 'children' | 'id'>[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      flatHeadings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: index + 1,
      });
    }
  });

  return buildHeadingTree(flatHeadings);
}

function buildHeadingTree(flat: Omit<HeadingItem, 'children' | 'id'>[]): HeadingItem[] {
  const root: HeadingItem[] = [];
  const stack: HeadingItem[] = [];

  flat.forEach((item) => {
    const node: HeadingItem = {
      ...item,
      children: [],
      id: `${item.level}-${item.text}-${item.line}`,
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });

  return root;
}

export function countWords(text: string): number {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  return words.length;
}
