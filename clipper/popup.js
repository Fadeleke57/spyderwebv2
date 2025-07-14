const API_BASE_URL = "https://vercel.spydr.dev";
const REDIRECT = "https://spydr.dev";

document.addEventListener("DOMContentLoaded", async function () {
  const dropdownInput = document.getElementById("dropdownInput");
  const dropdownList = document.getElementById("dropdownList");
  const detectedType = document.getElementById("detectedType");
  const saveButton = document.getElementById("saveButton");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingMessage = document.getElementById("loadingMessage");

  let selectedWebId = "";
  let webs = [];
  let detectedContent = { type: "", data: "", videoId: null };
  let searchTimeout = null;
  const DEBOUNCE_DELAY = 300; // ms

  console.log("WORKING!!!!");

  // Render the dropdown list with the given items
  function renderDropdownList(items) {
    dropdownList.innerHTML = "";
    if (items.length === 0) {
      const noResultsEl = document.createElement("div");
      noResultsEl.classList.add("no-results");
      noResultsEl.textContent = "No webs found";
      dropdownList.appendChild(noResultsEl);
      return;
    }
    items.forEach((web) => {
      const itemEl = document.createElement("div");
      itemEl.classList.add("dropdown-item");
      itemEl.dataset.webId = web.id || web.webId;
      itemEl.innerHTML = `
        <div class="dropdown-item-content">
          <span class="dropdown-item-name">${web.name || "Unnamed Web"}</span>
          <span>: </span>
          <span class="dropdown-item-meta">${
            web.sourceIds?.length || 0
          } source${
        web.sourceIds?.length && web.sourceIds?.length != 1 ? "s" : ""
      }</span>
        </div>
      `;
      itemEl.addEventListener("click", () => {
        selectedWebId = itemEl.dataset.webId;
        dropdownInput.value = web.name || "Unnamed Web";
        // Hide dropdown list after selection
        dropdownList.classList.remove("active");
      });
      dropdownList.appendChild(itemEl);
    });
  }

  // Toggle dropdown visibility on input focus and when typing
  dropdownInput.addEventListener("focus", async () => {
    dropdownList.classList.add("active");
    // show all webs when focused with empty query
    if (!dropdownInput.value) {
      await fetchAllWebs();
      renderDropdownList(webs);
    }
  });

  dropdownInput.addEventListener("input", (e) => {
    const query = e.target.value;

    // clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // set a new timeout for debouncing
    searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        // use semantic search when there's a query
        await searchWebs(query);
      } else {
        // fetch all webs when query is empty
        await fetchAllWebs();
      }
      renderDropdownList(webs);
    }, DEBOUNCE_DELAY);
  });

  // Hide dropdown when clicking outside the dropdown area
  document.addEventListener("click", (event) => {
    if (
      !dropdownInput.contains(event.target) &&
      !dropdownList.contains(event.target)
    ) {
      dropdownList.classList.remove("active");
    }
  });

  // Fetch all webs for the signed-in user
  async function fetchAllWebs(page = 1, pageSize = 10) {
    try {
      const token = await getAuthToken();
      console.log('[DEBUG] fetchAllWebs: token:', token);
      const response = await fetch(
        `${API_BASE_URL}/webs/all/user?page=${page}&page_size=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log('[DEBUG] fetchAllWebs: fetch status:', response.status);
      let data = null;
      try {
        data = await response.clone().json();
        console.log('[DEBUG] fetchAllWebs: fetch data:', data);
      } catch (jsonErr) {
        const text = await response.text();
        console.log('[DEBUG] fetchAllWebs: response not JSON, text:', text);
      }
      if (!response.ok) {
        throw new Error("Failed to fetch webs");
      }
      if (data && data.items) {
        webs = data.items;
      } else {
        webs = [];
      }
    } catch (error) {
      console.error("Error fetching webs:", error);
    }
  }

  // Search webs using semantic search endpoint
  async function searchWebs(query) {
    try {
      const token = await getAuthToken();
      const user = await getSignedInUser();

      // Use semantic search endpoint with userId filter
      const response = await fetch(
        `${API_BASE_URL}/webs/search?query=${encodeURIComponent(
          query
        )}&userId=${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search webs");
      }

      const data = await response.json();
      webs = data.result || [];
    } catch (error) {
      console.error("Error searching webs:", error);
      webs = []; // Clear results on error
    }
  }

  // Retrieve auth token from chrome storage
  async function getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["token"], (result) => {
        resolve(result.token || null);
      });
    });
  }

  async function getSignedInUser() {
    console.log("Getting signed in user");

    const url = `${API_BASE_URL}/auth/me`;

    const token = await getAuthToken();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      console.error("Failed to fetch signed in user!");
    }

    const data = await response.json();
    return data;
  }

  // Detect content type based on the active tab URL
  function extractYouTubeVideoId(url) {
    const videoIdRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(videoIdRegex);
    return match ? match[1] : null;
  }

  function showDetectedContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentURL = tabs[0].url;
      if (currentURL.includes("youtube.com/watch")) {
        const videoId = extractYouTubeVideoId(currentURL);
        detectedContent = {
          type: "YouTube Video",
          data: currentURL,
          videoId: videoId,
        };
      } else if (currentURL.endsWith(".pdf")) {
        detectedContent = { type: "PDF", data: currentURL };
      } else {
        detectedContent = { type: "Website", data: currentURL };
      }
      detectedType.textContent = `Detected: ${detectedContent.type}`;
      detectedUrl.textContent = detectedContent.data ? detectedContent.data : '';
      saveButton.textContent = `Save ${detectedContent.type}`;
    });
  }

  // Loading overlay control
  function showLoading(message = "Saving to Spydr...") {
    loadingMessage.textContent = message;
    loadingOverlay.classList.remove("hidden");
    saveButton.disabled = true;
  }

  function hideLoading() {
    loadingOverlay.classList.add("hidden");
    saveButton.disabled = false;
    window.close();
  }

  await fetchAllWebs();
  renderDropdownList(webs); // Show webs in dropdown on load
  showDetectedContent();

  // Save content when the button is clicked
  saveButton.addEventListener("click", async function () {
    if (!selectedWebId) {
      console.error("No web selected");
      return;
    }

    const currentToken = await getAuthToken();
    if (!currentToken) {
      console.error("No authentication token");
      return;
    }

    showLoading();

    try {
      let response;
      if (detectedContent.type === "Website") {
        response = await fetch(
          `${API_BASE_URL}/sources/website/${selectedWebId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({ url: detectedContent.data }),
          }
        );
      } else if (detectedContent.type === "YouTube Video") {
        if (!detectedContent.videoId) {
          console.error("Could not extract YouTube video ID");
          hideLoading();
          return;
        }

        response = await fetch(
          `${API_BASE_URL}/sources/youtube/${selectedWebId}/${detectedContent.videoId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );
      } else {
        console.error(`Saving for ${detectedContent.type} is not implemented`);
        hideLoading();
        return;
      }

      if (response.ok) {
        hideLoading();
      } else {
        const errorText = await response.text();
        console.error(`Failed to save content: ${errorText}`);
        hideLoading();
      }
    } catch (error) {
      console.error("Upload error:", error);
      hideLoading();
    }
  });
});
