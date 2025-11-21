/**
 * IronSyde Chrome Extension - Content Script
 * Runs on OnlyFans pages to detect messages and provide AI assistance
 */

const IRONSYDE_API_URL = "https://3000-i7tx48dj7x0ooqpsha2mg-2eadc94a.manus-asia.computer"; // Update with your deployed URL

let currentThreadId = null;
let isProcessing = false;

console.log("[IronSyde] Extension loaded on OnlyFans");

/**
 * Initialize the extension
 */
function init() {
  // Check if we're on the messages page
  if (window.location.pathname.includes("/my/chats")) {
    console.log("[IronSyde] On messages page");
    observeMessages();
    injectAIAssistantButton();
  }
}

/**
 * Observe for new messages
 */
function observeMessages() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        checkForNewMessages();
      }
    });
  });

  // Observe the chat container
  const chatContainer = document.querySelector('[data-test="chat-container"]') || document.body;
  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });

  console.log("[IronSyde] Message observer started");
}

/**
 * Check for new unread messages
 */
function checkForNewMessages() {
  const unreadChats = document.querySelectorAll('[data-test="unread-badge"]');
  
  if (unreadChats.length > 0) {
    console.log(`[IronSyde] Found ${unreadChats.length} unread chats`);
    
    // Show notification badge
    chrome.runtime.sendMessage({
      type: "UNREAD_MESSAGES",
      count: unreadChats.length,
    });
  }
}

/**
 * Inject AI Assistant button into the message input area
 */
function injectAIAssistantButton() {
  // Find the message input area
  const messageInput = document.querySelector('[data-test="message-input"]');
  
  if (!messageInput) {
    // Retry after a delay
    setTimeout(injectAIAssistantButton, 1000);
    return;
  }

  // Check if button already exists
  if (document.getElementById("ironsyde-ai-button")) {
    return;
  }

  // Create AI assistant button
  const aiButton = document.createElement("button");
  aiButton.id = "ironsyde-ai-button";
  aiButton.className = "ironsyde-ai-btn";
  aiButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>AI Suggest</span>
  `;
  
  aiButton.addEventListener("click", handleAISuggest);

  // Insert button next to the message input
  const inputContainer = messageInput.parentElement;
  inputContainer.style.position = "relative";
  inputContainer.appendChild(aiButton);

  console.log("[IronSyde] AI Assistant button injected");
}

/**
 * Handle AI suggestion request
 */
async function handleAISuggest(e) {
  e.preventDefault();
  
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  const button = e.currentTarget;
  button.disabled = true;
  button.innerHTML = '<span>Generating...</span>';

  try {
    // Get conversation context
    const messages = extractConversationHistory();
    const subscriberInfo = extractSubscriberInfo();

    // Request AI suggestion from IronSyde API
    const response = await fetch(`${IRONSYDE_API_URL}/api/onlyfans/suggest-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        subscriberInfo,
        threadId: currentThreadId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI suggestion");
    }

    const data = await response.json();
    
    // Show suggestion overlay
    showSuggestionOverlay(data.suggestion);

  } catch (error) {
    console.error("[IronSyde] Error getting AI suggestion:", error);
    alert("Failed to generate AI suggestion. Please make sure you're logged into IronSyde.");
  } finally {
    isProcessing = false;
    button.disabled = false;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>AI Suggest</span>
    `;
  }
}

/**
 * Extract conversation history from the page
 */
function extractConversationHistory() {
  const messageElements = document.querySelectorAll('[data-test="message"]');
  const messages = [];

  messageElements.forEach((el) => {
    const isOwn = el.classList.contains("own-message") || el.hasAttribute("data-own");
    const content = el.querySelector('[data-test="message-content"]')?.textContent || el.textContent;

    messages.push({
      role: isOwn ? "assistant" : "user",
      content: content.trim(),
    });
  });

  return messages.slice(-10); // Last 10 messages for context
}

/**
 * Extract subscriber information
 */
function extractSubscriberInfo() {
  const username = document.querySelector('[data-test="chat-username"]')?.textContent || "";
  const avatar = document.querySelector('[data-test="chat-avatar"] img')?.src || "";

  return {
    username: username.trim(),
    avatar,
  };
}

/**
 * Show AI suggestion overlay
 */
function showSuggestionOverlay(suggestion) {
  // Remove existing overlay
  const existing = document.getElementById("ironsyde-suggestion-overlay");
  if (existing) {
    existing.remove();
  }

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "ironsyde-suggestion-overlay";
  overlay.className = "ironsyde-overlay";
  overlay.innerHTML = `
    <div class="ironsyde-overlay-content">
      <div class="ironsyde-overlay-header">
        <h3>AI Suggested Response</h3>
        <button class="ironsyde-close-btn" onclick="this.closest('.ironsyde-overlay').remove()">×</button>
      </div>
      <div class="ironsyde-overlay-body">
        <textarea id="ironsyde-suggestion-text" rows="4">${suggestion}</textarea>
      </div>
      <div class="ironsyde-overlay-footer">
        <button class="ironsyde-btn-secondary" onclick="this.closest('.ironsyde-overlay').remove()">Cancel</button>
        <button class="ironsyde-btn-primary" onclick="window.ironSydeUseSuggestion()">Use This Response</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

/**
 * Use the suggested response
 */
window.ironSydeUseSuggestion = function() {
  const suggestionText = document.getElementById("ironsyde-suggestion-text").value;
  const messageInput = document.querySelector('[data-test="message-input"]');

  if (messageInput) {
    // Set the value
    messageInput.value = suggestionText;
    messageInput.textContent = suggestionText;

    // Trigger input event
    const event = new Event("input", { bubbles: true });
    messageInput.dispatchEvent(event);

    // Close overlay
    document.getElementById("ironsyde-suggestion-overlay").remove();

    console.log("[IronSyde] Suggestion applied");
  }
};

/**
 * Detect current thread ID
 */
function detectThreadId() {
  const match = window.location.pathname.match(/\/chat\/([^\/]+)/);
  if (match) {
    currentThreadId = match[1];
    console.log("[IronSyde] Thread ID:", currentThreadId);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Detect thread changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    detectThreadId();
    injectAIAssistantButton();
  }
}).observe(document, { subtree: true, childList: true });

detectThreadId();

