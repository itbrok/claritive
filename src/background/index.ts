import { modelManager } from "./model-manager";

// Simplified for testing registration
console.log('Claritive Background Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ask-claritive",
    title: "Ask Claritive",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ask-claritive" && tab?.id) {
    chrome.sidePanel.open({ tabId: tab.id });
    setTimeout(() => {
        chrome.runtime.sendMessage({
            action: "ASK_QUESTION",
            text: info.selectionText
        }).catch(() => {
            // Might fail if sidepanel is not yet fully loaded/listening
        });
    }, 500);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-claritive") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "LOAD_MODEL") {
    modelManager.loadModel(message.modelId, (progress) => {
      chrome.runtime.sendMessage({
        action: "MODEL_LOAD_PROGRESS",
        progress
      }).catch(() => {});
    })
    .then(() => sendResponse({ success: true }))
    .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "GENERATE_RESPONSE") {
    const engine = modelManager.getEngine();
    if (!engine) {
      sendResponse({ success: false, error: "No model loaded" });
      return;
    }

    engine.generate(message.messages, {
      onUpdate: (chunk) => {
        chrome.runtime.sendMessage({
          action: "GENERATION_CHUNK",
          chunk
        }).catch(() => {});
      }
    })
    .then((fullText) => sendResponse({ success: true, fullText }))
    .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
