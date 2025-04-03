chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        let url = new URL(tab.url);
        let domain = url.hostname;

        chrome.storage.local.get(["trackingData"], (result) => {
            let data = result.trackingData || {};
            data[domain] = (data[domain] || 0) + 1;
            chrome.storage.local.set({ trackingData: data });
        });
    }
});
