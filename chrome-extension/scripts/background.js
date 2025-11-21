/**
 * IronSyde Chrome Extension - Background Script
 * Handles communication between content script and IronSyde backend
 */

const IRONSYDE_API_URL = "https://your-ironsyde-domain.manus.space/api";

// Store authentication token
let authToken = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAISuggestion") {
    handleGetAISuggestion(request.data, sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === "sendMessage") {
    handleSendMessage(request.data, sendResponse);
    return true;
  }

  if (request.action === "authenticate") {
    handleAuthentication(request.data, sendResponse);
    return true;
  }

  if (request.action === "generatePhoto") {
    handleGeneratePhoto(request.data, sendResponse);
    return true;
  }
});

/**
 * Handle authentication with IronSyde
 */
async function handleAuthentication(data, sendResponse) {
  try {
    const response = await fetch(`${IRONSYDE_API_URL}/auth/extension`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: data.apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const result = await response.json();
    authToken = result.token;

    // Store token
    chrome.storage.local.set({ authToken: result.token });

    sendResponse({ success: true, token: result.token });
  } catch (error) {
    console.error("Authentication error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Get AI suggestion for a message
 */
async function handleGetAISuggestion(data, sendResponse) {
  try {
    if (!authToken) {
      // Try to get token from storage
      const stored = await chrome.storage.local.get("authToken");
      authToken = stored.authToken;
    }

    if (!authToken) {
      throw new Error("Not authenticated. Please configure your API key.");
    }

    const response = await fetch(`${IRONSYDE_API_URL}/onlyfans/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        message: data.message,
        conversationHistory: data.conversationHistory || [],
        personality: data.personality || "flirty",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI suggestion");
    }

    const result = await response.json();
    sendResponse({ success: true, suggestion: result.suggestion });
  } catch (error) {
    console.error("AI suggestion error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Send message through OnlyFans
 */
async function handleSendMessage(data, sendResponse) {
  try {
    // Log the message to IronSyde analytics
    if (authToken) {
      await fetch(`${IRONSYDE_API_URL}/onlyfans/log-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fanId: data.fanId,
          message: data.message,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    sendResponse({ success: true });
  } catch (error) {
    console.error("Send message error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Generate NSFW photo
 */
async function handleGeneratePhoto(data, sendResponse) {
  try {
    if (!authToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${IRONSYDE_API_URL}/avatars/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        prompt: data.prompt,
        model: "seedream-4",
        width: 1024,
        height: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate photo");
    }

    const result = await response.json();
    sendResponse({ success: true, imageUrl: result.imageUrl });
  } catch (error) {
    console.error("Photo generation error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("IronSyde Extension installed");
});

