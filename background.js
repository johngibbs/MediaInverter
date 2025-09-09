// background.js - Registers a context menu item and relays toggle requests to the active tab.

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "invert-media",
      title: "Invert image / video / SVG",
      contexts: ["all"]
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "invert-media" && tab && tab.id != null) {
    try {
      chrome.tabs.sendMessage(tab.id, { command: "toggle-invert" });
    } catch (_) {
      // Ignore errors (e.g., no content script on this page).
    }
  }
});