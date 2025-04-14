// contentScript.js
console.log("Content script loaded.");

// Create a script element whose source is our injected.js file from the extension
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  // Optionally remove the script after it loads
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for the message from injected.js
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === "SPYDR_TOKEN") {
    const token = event.data.token;
    console.log("Content script received token:", token);
    chrome.storage.local.set({ token: token }, () => {
      console.log("Token stored in extension storage.");
    });
  }
});
