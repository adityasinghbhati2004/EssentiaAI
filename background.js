//add this file to extension 
// this will prompt the user to enter their API key on first install

chrome.runtime.onInstalled.addListener(() => {
    
    chrome.storage.sync.get(
        ["geminiApiKey"], (result) => {
            if (!result.geminiApiKey) {
                chrome.tabs.create({url: "options.html" ,});
            }
    });
});

