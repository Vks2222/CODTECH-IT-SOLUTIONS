document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["trackingData"], (result) => {
        let data = result.trackingData || {};
        document.getElementById("time-tracked").innerText = JSON.stringify(data, null, 2);
    });

    document.getElementById("view-dashboard").addEventListener("click", () => {
        chrome.tabs.create({ url: "dashboard/index.html" });
    });
});
