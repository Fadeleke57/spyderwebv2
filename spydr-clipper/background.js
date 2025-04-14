const API_BASE_URL = "http://localhost:8000";  // Change if deployed

// Utility function to get the auth token from chrome.storage
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token"], (result) => {
      console.log("getAuthToken: retrieved token", result.token);
      resolve(result.token || null);
    });
  });
}

// Utility function to get the selected web ID from chrome.storage
async function getSelectedWebId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["selectedWebId"], (result) => {
      console.log("getSelectedWebId: retrieved selectedWebId", result.selectedWebId);
      resolve(result.selectedWebId || null);
    });
  });
}

console.log("Background service worker started")

// Create a context menu item that appears on pages and links
chrome.contextMenus.create({
  id: "saveToSpydr",
  title: "Save to Spydr Web",
  contexts: ["link", "page"]
});

// Listener for when the context menu item is clicked
chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  console.log("Context menu clicked");
  const url = info.linkUrl || tab.url;
  console.log("URL determined:", url);
  let detectedType = "Website";

  // Determine the type based on the URL
  if (url.includes("youtube.com/watch")) {
    detectedType = "YouTube Video";
  } else if (url.endsWith(".pdf")) {
    detectedType = "PDF";
  }
  console.log("Detected type:", detectedType);

  const selectedWebId = await getSelectedWebId();
  console.log("Selected web ID:", selectedWebId);

  if (!selectedWebId) {
    alert("Please open the extension and select a web first.");
    return;
  }

  // Handle website uploads in the background
  if (detectedType === "Website") {
    try {
      const token = await getAuthToken();
      if (!token) {
        alert("Not authenticated.");
        return;
      }
      console.log("Token for uploading:", token);
      
      // Construct the API endpoint for adding a website source
      const endpoint = `${API_BASE_URL}/sources/website/${selectedWebId}`;
      console.log("Uploading to endpoint:", endpoint);
      
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url: url })
      };
      console.log("Request options:", options);
      console.log("Starting upload for website...");
      
      const response = await fetch(endpoint, options);
      console.log("Response received, status:", response.status);
      
      if (response.ok) {
        console.log("Website upload successful");
        alert("Website saved successfully!");
      } else {
        const errorText = await response.text();
        console.log("Website upload failed, error:", errorText);
        alert(`Failed to save website. Status: ${response.status}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error saving website:", error);
      alert("Error saving website. Check console for details.");
    }
  } else if (detectedType === "PDF") {
    // For PDFs, use your existing logic (or update as needed)
    const endpoint = `${API_BASE_URL}/upload-pdf`;
    console.log("Uploading PDF to endpoint:", endpoint);
    
    const bodyData = new FormData();
    bodyData.append("web_id", selectedWebId);
    bodyData.append("file_url", url);
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: bodyData
      });
      console.log("PDF upload response status:", response.status);
      
      if (response.ok) {
        console.log("PDF upload successful");
        alert("PDF saved successfully!");
      } else {
        console.log("PDF upload failed");
        alert("Failed to save PDF.");
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
    }
  } else {
    // For other types (like YouTube Video)
    alert(`Saving for ${detectedType} is not implemented yet.`);
  }
});
