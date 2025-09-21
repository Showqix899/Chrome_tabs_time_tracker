let activeTabId = null;
let activeDomain = null;
let startTime = null;

function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// Save elapsed time for active site
function saveTime() {
  if (activeDomain && startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    chrome.storage.local.get([activeDomain], (result) => {
      let total = result[activeDomain] || 0;
      total += elapsed;

      chrome.storage.local.set({ [activeDomain]: total });
    });
  }
}

function switchToTab(tabId) {
  saveTime();
  activeTabId = tabId;
  startTime = Date.now();

  chrome.tabs.get(tabId, (tab) => {
    activeDomain = extractDomain(tab.url);
  });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  switchToTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    switchToTab(tabId);
  }
});

chrome.runtime.onSuspend.addListener(() => {
  saveTime();
});

// Messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "getAllRecords") {
    chrome.storage.local.get(null, (allRecords) => {
      sendResponse(allRecords);
    });
    return true;
  }

  // clear one domain
  if (msg.type === "clearDomain") {
    chrome.storage.local.remove(msg.domain, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // clear all
  if (msg === "clearAll") {
    chrome.storage.local.clear(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});