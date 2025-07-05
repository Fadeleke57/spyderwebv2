const API_BASE_URL = "https://vercel.spydr.dev";
const REDIRECT = "https://spydr.dev";

document.addEventListener("DOMContentLoaded", async () => {
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
      itemEl.dataset.webId = web.webId;
      itemEl.innerHTML = `
        <div class="dropdown-item-content">
          <span class="dropdown-item-name">${web.name || "Unnamed Web"}</span>
          <span>: </span>
          <span class="dropdown-item-meta">${
            web.sourceIds?.length || 0
          } source${web.sourceIds?.length === 1 ? "" : "s"}</span>
        </div>
      `;
      itemEl.addEventListener("click", () => {
        selectedWebId = itemEl.dataset.webId;
        dropdownInput.value = web.name || "Unnamed Web";
        dropdownList.classList.remove("active");
      });
      dropdownList.appendChild(itemEl);
    });
  }

  dropdownInput.addEventListener("focus", async () => {
    dropdownList.classList.add("active");
    if (!dropdownInput.value) {
      await fetchAllWebs();
    }
  });

  dropdownInput.addEventListener("input", (e) => {
    const query = e.target.value;
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        await searchWebs(query);
      } else {
        await fetchAllWebs();
      }
    }, DEBOUNCE_DELAY);
  });

  document.addEventListener("click", (event) => {
    if (
      !dropdownInput.contains(event.target) &&
      !dropdownList.contains(event.target)
    ) {
      dropdownList.classList.remove("active");
    }
  });

  async function fetchAllWebs(page = 1, pageSize = 10) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/webs/all/user?page=${page}&page_size=${pageSize}`,
        { credentials: "include" }
      );
      if (res.status === 401) {
        window.open(`${REDIRECT}/login`, "_blank");
        return;
      }
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      webs = data.items;
      renderDropdownList(webs);
    } catch (err) {
      console.error("Error fetching webs:", err);
    }
  }

  async function searchWebs(query) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/webs/search?query=${encodeURIComponent(query)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      webs = data.result || [];
      renderDropdownList(webs);
    } catch (err) {
      console.error("Error searching webs:", err);
      webs = [];
      renderDropdownList(webs);
    }
  }

  function extractYouTubeVideoId(url) {
    const re =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const m = url.match(re);
    return m ? m[1] : null;
  }

  function showDetectedContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      if (url.includes("youtube.com/watch")) {
        detectedContent = { type: "YouTube Video", data: url, videoId: extractYouTubeVideoId(url) };
      } else if (url.endsWith(".pdf")) {
        detectedContent = { type: "PDF", data: url };
      } else {
        detectedContent = { type: "Website", data: url };
      }
      detectedType.textContent = `Detected: ${detectedContent.type}`;
      saveButton.textContent = `Save ${detectedContent.type}`;
    });
  }

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

  saveButton.addEventListener("click", async () => {
    if (!selectedWebId) {
      console.error("No web selected");
      return;
    }
    showLoading();
    try {
      let res;
      if (detectedContent.type === "Website") {
        res = await fetch(
          `${API_BASE_URL}/sources/website/${selectedWebId}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: detectedContent.data }),
          }
        );
      } else if (detectedContent.type === "YouTube Video") {
        if (!detectedContent.videoId) {
          console.error("No YouTube ID");
          hideLoading();
          return;
        }
        res = await fetch(
          `${API_BASE_URL}/sources/youtube/${selectedWebId}/${detectedContent.videoId}`,
          { method: "POST", credentials: "include" }
        );
      } else {
        console.error("Unsupported type:", detectedContent.type);
        hideLoading();
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }
      hideLoading();
    } catch (err) {
      console.error("Save error:", err);
      hideLoading();
    }
  });

  // Initialize
  await fetchAllWebs();
  showDetectedContent();
});
