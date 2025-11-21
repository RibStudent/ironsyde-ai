import puppeteer, { Browser, Page } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Add stealth plugin to avoid bot detection
const puppeteerExtra = require("puppeteer-extra");
puppeteerExtra.use(StealthPlugin());

export interface OnlyFansCredentials {
  username: string;
  password: string;
}

export interface OnlyFansMessage {
  id: string;
  subscriberId: string;
  subscriberUsername: string;
  subscriberAvatar?: string;
  content: string;
  timestamp: Date;
  threadId: string;
  isRead: boolean;
}

export class OnlyFansBrowser {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;

  /**
   * Initialize browser with stealth mode
   * Note: For Docker environments, set PUPPETEER_DISABLE_SANDBOX=true
   */
  async init(): Promise<void> {
    const args = [
      "--disable-blink-features=AutomationControlled",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ];

    // Only disable sandbox if explicitly required (e.g., in Docker)
    // This is a security risk and should be avoided when possible
    if (process.env.PUPPETEER_DISABLE_SANDBOX === "true") {
      console.warn(
        "[Security Warning] Running Puppeteer without sandbox. Only use in trusted environments."
      );
      args.push("--no-sandbox", "--disable-setuid-sandbox");
    }

    this.browser = await puppeteerExtra.launch({
      headless: true, // Set to false for debugging
      args,
    });

    this.page = await this.browser.newPage();

    // Set realistic viewport
    await this.page.setViewport({ width: 1920, height: 1080 });

    // Set user agent
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Block unnecessary resources to speed up
    await this.page.setRequestInterception(true);
    this.page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  /**
   * Login to OnlyFans
   */
  async login(credentials: OnlyFansCredentials): Promise<boolean> {
    if (!this.page) throw new Error("Browser not initialized");

    try {
      // Navigate to OnlyFans login page
      await this.page.goto("https://onlyfans.com/", {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // Wait for login form
      await this.page.waitForSelector('input[name="email"]', { timeout: 10000 });

      // Fill in credentials
      await this.page.type('input[name="email"]', credentials.username, {
        delay: 100,
      });
      await this.page.type('input[name="password"]', credentials.password, {
        delay: 100,
      });

      // Click login button
      await this.page.click('button[type="submit"]');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 });

      // Check if login was successful
      const currentUrl = this.page.url();
      this.isLoggedIn = currentUrl.includes("/my/") || currentUrl.includes("/home");

      if (this.isLoggedIn) {
        console.log("[OnlyFans] Login successful");
      } else {
        console.error("[OnlyFans] Login failed - may require 2FA or CAPTCHA");
      }

      return this.isLoggedIn;
    } catch (error) {
      console.error("[OnlyFans] Login error:", error);
      return false;
    }
  }

  /**
   * Get session cookies for future use
   */
  async getSessionCookies(): Promise<any[]> {
    if (!this.page) throw new Error("Browser not initialized");
    return await this.page.cookies();
  }

  /**
   * Restore session from cookies
   */
  async restoreSession(cookies: any[]): Promise<void> {
    if (!this.page) throw new Error("Browser not initialized");
    await this.page.setCookie(...cookies);
    this.isLoggedIn = true;
  }

  /**
   * Navigate to messages page
   */
  async navigateToMessages(): Promise<void> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error("Not logged in");
    }

    await this.page.goto("https://onlyfans.com/my/chats", {
      waitUntil: "networkidle2",
    });
  }

  /**
   * Fetch unread messages
   */
  async fetchUnreadMessages(): Promise<OnlyFansMessage[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error("Not logged in");
    }

    try {
      await this.navigateToMessages();

      // Wait for chat list to load
      await this.page.waitForSelector('[data-test="chat-item"]', { timeout: 10000 });

      // Extract messages using page.evaluate
      const messages = await this.page.evaluate(() => {
        const chatItems = document.querySelectorAll('[data-test="chat-item"]');
        const results: any[] = [];

        chatItems.forEach((item) => {
          const unreadBadge = item.querySelector('[data-test="unread-badge"]');
          if (!unreadBadge) return; // Skip read messages

          const username = item.querySelector('[data-test="username"]')?.textContent || "";
          const avatar = item.querySelector("img")?.getAttribute("src") || "";
          const lastMessage = item.querySelector('[data-test="last-message"]')?.textContent || "";
          const threadId = item.getAttribute("data-thread-id") || "";

          results.push({
            subscriberUsername: username.trim(),
            subscriberAvatar: avatar,
            content: lastMessage.trim(),
            threadId,
            isRead: false,
          });
        });

        return results;
      });

      // Transform to OnlyFansMessage format
      return messages.map((msg, index) => ({
        id: `msg_${Date.now()}_${index}`,
        subscriberId: msg.threadId,
        subscriberUsername: msg.subscriberUsername,
        subscriberAvatar: msg.subscriberAvatar,
        content: msg.content,
        timestamp: new Date(),
        threadId: msg.threadId,
        isRead: false,
      }));
    } catch (error) {
      console.error("[OnlyFans] Error fetching messages:", error);
      return [];
    }
  }

  /**
   * Open a specific conversation
   */
  async openConversation(threadId: string): Promise<void> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error("Not logged in");
    }

    await this.page.goto(`https://onlyfans.com/my/chats/chat/${threadId}`, {
      waitUntil: "networkidle2",
    });
  }

  /**
   * Send a message
   */
  async sendMessage(threadId: string, message: string): Promise<boolean> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error("Not logged in");
    }

    try {
      await this.openConversation(threadId);

      // Wait for message input
      await this.page.waitForSelector('[data-test="message-input"]', { timeout: 10000 });

      // Type message
      await this.page.type('[data-test="message-input"]', message, { delay: 50 });

      // Click send button
      await this.page.click('[data-test="send-button"]');

      // Wait a bit for the message to send
      await this.page.waitForTimeout(2000);

      console.log(`[OnlyFans] Message sent to thread ${threadId}`);
      return true;
    } catch (error) {
      console.error("[OnlyFans] Error sending message:", error);
      return false;
    }
  }

  /**
   * Send media (photo/video)
   */
  async sendMedia(threadId: string, mediaPath: string, caption?: string): Promise<boolean> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error("Not logged in");
    }

    try {
      await this.openConversation(threadId);

      // Click upload button
      const fileInput = await this.page.$('input[type="file"]');
      if (!fileInput) throw new Error("File input not found");

      await fileInput.uploadFile(mediaPath);

      // Wait for upload to complete
      await this.page.waitForTimeout(3000);

      // Add caption if provided
      if (caption) {
        await this.page.type('[data-test="message-input"]', caption, { delay: 50 });
      }

      // Click send
      await this.page.click('[data-test="send-button"]');

      await this.page.waitForTimeout(2000);

      console.log(`[OnlyFans] Media sent to thread ${threadId}`);
      return true;
    } catch (error) {
      console.error("[OnlyFans] Error sending media:", error);
      return false;
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }
}

