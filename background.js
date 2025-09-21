let activeTabId = null;
let startTime = null;
let timeSpent = {}; // { tabId: totalSeconds }

chrome.tabs.onActivated.addListener(activeInfo => {
  // Save time spent on the old tab
  if (activeTabId !== null && startTime !== null) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeSpent[activeTabId] = (timeSpent[activeTabId] || 0) + elapsed;
  }
  // Switch to new tab
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
});

chrome.tabs.onRemoved.addListener(tabId => {
  // Store time if closed
  if (timeSpent[tabId]) {
    delete timeSpent[tabId];
  }
});

// Helper for popup.js to get current tab time
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "getTime") {
    const now = Date.now();
    let total = timeSpent[activeTabId] || 0;
    if (activeTabId !== null && startTime !== null) {
      total += Math.floor((now - startTime) / 1000);
    }
    sendResponse({ seconds: total });
  }
});