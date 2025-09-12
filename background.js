// background.js - Registers a context menu item and relays toggle requests to the active tab.

// Utility function to create the context menu item.
function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "invert-media",
      title: "Invert image / video / SVG",
      contexts: ["all"]
    });
  });
}

// Create the context menu item when the extension is installed or the browser starts.
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});  
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});  

// Handle clicks on the context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "invert-media" && tab && tab.id != null) {
    try {
      chrome.tabs.sendMessage(tab.id, { command: "toggle-invert" });
    } catch (_) {
      // Ignore errors (e.g., no content script on this page).
    }
  }
});