# Claritive - Local AI Browser Assistant

Claritive is a privacy-first Chrome extension that runs AI models locally in your browser.

## Features
- **Local AI**: No data leaves your browser.
- **Side Panel**: Persistent AI assistant that can read the current webpage.
- **Context Extraction**: Automatically extracts content from the active tab.
- **Prompt Library**: Pre-built prompts for summarization, analysis, and more.

## Installation (Development Mode)
1. Clone this repository.
2. Install dependencies: `pnpm install`.
3. Build the extension: `pnpm build`.
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** (toggle in the top-right).
6. Click **Load unpacked** and select the `dist` folder in the project directory.

## Usage
- Click the Claritive icon in the toolbar to open the popup.
- Use `Alt+C` or the context menu "Ask Claritive" to open the side panel.
- Select text on any page, right-click, and choose "Ask Claritive".

## Tech Stack
- React, TypeScript, Vite
- Tailwind CSS
- WebLLM, Transformers.js
- CRXJS Vite Plugin
