# Claritive - Local AI Browser Assistant

Claritive is a privacy-first Chrome extension that runs AI models locally in your browser.

## Features
- **Local AI**: No data leaves your browser.
- **Side Panel**: Persistent AI assistant that can read the current webpage.
- **Context Extraction**: Automatically extracts content from the active tab.
- **Prompt Library**: Pre-built prompts for summarization, analysis, and more.

## Compatibility
- **Chrome / Edge**: Version **114 or later** is required for the Side Panel API.
- **Hardware**: Requires a GPU with WebGL/WebGPU support and at least 8GB of RAM (16GB recommended for larger models).

## Prerequisites
- **Node.js**: Version 20.x or later.
- **pnpm**: Version 9.x or later.

## Installation (Development Mode)
1. Clone this repository.
2. Install dependencies: `pnpm install`.
3. Build the extension: `pnpm build`.
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** (top-right).
6. Click **Load unpacked** and select the `dist` folder.

## First Run & Model Loading
The first time you ask a question, Claritive will download the selected AI model (e.g., Llama 3).
- **Model Sizes**: Models are typically between **1.5GB and 5GB**.
- **Download**: Depending on your internet speed, this may take a few minutes.
- **Progress**: You will see a progress bar in the chat interface during initialization.
- **Cache**: Models are cached locally in your browser's indexedDB/Cache API after the first download.

## Troubleshooting
- **"Error: No model loaded"**: This usually happens if the AI engine failed to initialize. Ensure you have a stable connection for the first download and that your browser supports WebGPU/WebGL.
- **Missing Styles**: Ensure you ran `pnpm build` after making changes to CSS or Tailwind configurations.
- **Slow Responses**: Local AI performance depends on your GPU. Ensure "Hardware acceleration" is enabled in Chrome settings.

## Tech Stack
- React 19, TypeScript, Vite 6
- Tailwind CSS 4
- WebLLM, Transformers.js
- CRXJS Vite Plugin
