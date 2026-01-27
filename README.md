# Markdown Editor

Desktop Markdown editor built with Tauri, React, and TypeScript. It focuses on fast writing, live preview, and simple file workflows in a native shell.

## Features
- Tabbed editor with unsaved-change indicator
- Live preview with syntax highlighting
- Outline panel generated from headings with click-to-jump
- Toolbar actions for common Markdown formatting
- Native open/save dialogs
- Export to PDF, DOCX, and HTML
- Light/dark theme toggle and resizable split view
- Keyboard shortcuts for common actions

## Requirements
- Node.js (for Vite tooling)
- Rust toolchain (for Tauri)
- Tauri system prerequisites for your OS
- Pandoc available on PATH for DOCX export (and PDF fallback)

## Installation
```bash
npm install
```

## Development
Run the UI in a browser:
```bash
npm run dev
```

Run the desktop app:
```bash
npm run tauri dev
```

## Build
Build the web assets:
```bash
npm run build
```

Build the desktop bundle:
```bash
npm run tauri build
```

## Usage
- Create a new tab or open a Markdown file.
- Edit on the left and preview on the right.
- Use the outline panel to jump between headings.
- Export from the toolbar when you need PDF, DOCX, or HTML.

## Keyboard shortcuts
- `Ctrl/Cmd + N` new file
- `Ctrl/Cmd + O` open file
- `Ctrl/Cmd + S` save file
- `Ctrl/Cmd + B` bold
- `Ctrl/Cmd + I` italic
- `Ctrl/Cmd + K` link
- `Ctrl/Cmd + \`` inline code

## Scripts
- `npm run dev` start Vite dev server
- `npm run build` build web assets
- `npm run preview` preview built assets
- `npm run tauri dev` run Tauri in development
- `npm run tauri build` build Tauri app bundle

## Notes
- This is a desktop app, not a hosted web service.
- DOCX export requires Pandoc installed and available on PATH.

## License
No license file is included in this repository.
