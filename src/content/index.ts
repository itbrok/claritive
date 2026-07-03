import { extractPageContent } from './extractor';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'GET_PAGE_CONTENT') {
    const content = extractPageContent();
    sendResponse(content);
  }
  return true;
});

console.log('Claritive content script loaded.');
