/**
 * IronSyde Chrome Extension - Popup Script
 * Handles the extension popup UI and settings
 */

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const apiKeyInput = document.getElementById("apiKey");
  const connectBtn = document.getElementById("connectBtn");
  const disconnectBtn = document.getElementById("disconnectBtn");
  const personalitySelect = document.getElementById("personality");
  const messagesCount = document.getElementById("messagesCount");
  const creditsRemaining = document.getElementById("creditsRemaining");

  // Check if already authenticated
  const stored = await chrome.storage.local.get(["authToken", "personality", "stats"]);
  
  if (stored.authToken) {
    showDashboard();
    if (stored.personality) {
      personalitySelect.value = stored.personality;
    }
    if (stored.stats) {
      updateStats(stored.stats);
    }
  }

  // Connect button
  connectBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      alert("Please enter your API key");
      return;
    }

    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";

    try {
      const response = await chrome.runtime.sendMessage({
        action: "authenticate",
        data: { apiKey },
      });

      if (response.success) {
        await chrome.storage.local.set({ authToken: response.token });
        showDashboard();
      } else {
        alert("Connection failed: " + response.error);
      }
    } catch (error) {
      alert("Connection error: " + error.message);
    } finally {
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect to IronSyde";
    }
  });

  // Disconnect button
  disconnectBtn.addEventListener("click", async () => {
    await chrome.storage.local.clear();
    showLogin();
  });

  // Personality change
  personalitySelect.addEventListener("change", async () => {
    await chrome.storage.local.set({ personality: personalitySelect.value });
  });

  function showDashboard() {
    status.className = "status connected";
    status.textContent = "✓ Connected to IronSyde";
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
  }

  function showLogin() {
    status.className = "status disconnected";
    status.textContent = "⚠️ Not connected to IronSyde";
    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }

  function updateStats(stats) {
    messagesCount.textContent = stats.messagesToday || 0;
    creditsRemaining.textContent = stats.credits || 0;
  }

  // Refresh stats every 30 seconds
  setInterval(async () => {
    const stored = await chrome.storage.local.get("stats");
    if (stored.stats) {
      updateStats(stored.stats);
    }
  }, 30000);
});

