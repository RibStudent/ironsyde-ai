import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  tier: mysqlEnum("tier", ["free", "standard", "premium"]).default("free").notNull(),
  credits: int("credits").default(12000).notNull(), // AI generation credits
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Avatars table - stores generated AI avatars
 */
export const avatars = mysqlTable("avatars", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negativePrompt"),
  imageUrl: text("imageUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  model: varchar("model", { length: 128 }).notNull(), // e.g., "flux-pro", "sdxl"
  isNsfw: boolean("isNsfw").default(true).notNull(),
  width: int("width").default(1024),
  height: int("height").default(1024),
  seed: int("seed"),
  steps: int("steps").default(30),
  guidanceScale: int("guidanceScale").default(7),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Avatar = typeof avatars.$inferSelect;
export type InsertAvatar = typeof avatars.$inferInsert;

/**
 * Generation history - tracks all generation attempts
 */
export const generationHistory = mysqlTable("generationHistory", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  avatarId: varchar("avatarId", { length: 64 }),
  prompt: text("prompt").notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  creditsUsed: int("creditsUsed").default(1).notNull(),
  processingTime: int("processingTime"), // in seconds
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type GenerationHistory = typeof generationHistory.$inferSelect;
export type InsertGenerationHistory = typeof generationHistory.$inferInsert;


/**
 * User subscriptions table
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().unique(),
  tier: mysqlEnum("tier", ["free", "standard", "premium"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "canceled", "expired"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Conversations table - chat sessions with avatars
 */
export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  avatarId: varchar("avatarId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }),
  avatarPersonality: text("avatarPersonality"), // JSON string with personality traits
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - individual chat messages
 */
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversationId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"), // For NSFW photo responses
  audioUrl: text("audioUrl"), // For voice messages
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Voice calls table - Twilio voice chat sessions
 */
export const voiceCalls = mysqlTable("voiceCalls", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  conversationId: varchar("conversationId", { length: 64 }).notNull(),
  twilioCallSid: varchar("twilioCallSid", { length: 255 }),
  status: mysqlEnum("status", ["initiated", "ringing", "in-progress", "completed", "failed"]).default("initiated").notNull(),
  duration: int("duration"), // in seconds
  recordingUrl: text("recordingUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
  endedAt: timestamp("endedAt"),
});

export type VoiceCall = typeof voiceCalls.$inferSelect;
export type InsertVoiceCall = typeof voiceCalls.$inferInsert;



/**
 * OnlyFans Integration Tables
 */

/**
 * OnlyFans account connections
 */
export const onlyfansAccounts = mysqlTable("onlyfansAccounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  // OnlyFans credentials (encrypted)
  username: varchar("username", { length: 255 }).notNull(),
  encryptedPassword: text("encryptedPassword").notNull(),
  
  // Session data
  sessionCookies: json("sessionCookies"),
  lastLoginAt: timestamp("lastLoginAt"),
  
  // Account info
  profileName: varchar("profileName", { length: 255 }),
  profileImage: text("profileImage"),
  subscriberCount: int("subscriberCount").default(0),
  
  // Automation settings
  autoResponseEnabled: boolean("autoResponseEnabled").default(true).notNull(),
  autoContentDelivery: boolean("autoContentDelivery").default(false).notNull(),
  responseDelay: int("responseDelay").default(30), // seconds
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type OnlyFansAccount = typeof onlyfansAccounts.$inferSelect;
export type InsertOnlyFansAccount = typeof onlyfansAccounts.$inferInsert;

/**
 * OnlyFans messages/conversations
 */
export const onlyfansMessages = mysqlTable("onlyfansMessages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  accountId: varchar("accountId", { length: 64 }).notNull(),
  
  // Subscriber info
  subscriberId: varchar("subscriberId", { length: 255 }).notNull(),
  subscriberUsername: varchar("subscriberUsername", { length: 255 }).notNull(),
  subscriberAvatar: text("subscriberAvatar"),
  
  // Message content
  messageType: varchar("messageType", { length: 64 }).notNull(), // 'text', 'media_request', 'tip', 'ppv_purchase'
  content: text("content"),
  mediaUrls: json("mediaUrls"), // Array of media URLs if any
  
  // Direction
  isIncoming: boolean("isIncoming").notNull(),
  
  // AI Response
  aiGenerated: boolean("aiGenerated").default(false).notNull(),
  aiModel: varchar("aiModel", { length: 128 }),
  responseTime: int("responseTime"), // milliseconds
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  needsManualReview: boolean("needsManualReview").default(false).notNull(),
  wasSent: boolean("wasSent").default(false).notNull(),
  
  // Metadata
  onlyfansMessageId: varchar("onlyfansMessageId", { length: 255 }),
  threadId: varchar("threadId", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  sentAt: timestamp("sentAt"),
});

export type OnlyFansMessage = typeof onlyfansMessages.$inferSelect;
export type InsertOnlyFansMessage = typeof onlyfansMessages.$inferInsert;

/**
 * Content requests from subscribers
 */
export const onlyfansContentRequests = mysqlTable("onlyfansContentRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  accountId: varchar("accountId", { length: 64 }).notNull(),
  messageId: varchar("messageId", { length: 64 }),
  
  // Subscriber
  subscriberId: varchar("subscriberId", { length: 255 }).notNull(),
  subscriberUsername: varchar("subscriberUsername", { length: 255 }).notNull(),
  
  // Request details
  requestType: varchar("requestType", { length: 64 }).notNull(), // 'photo', 'video', 'custom'
  requestDescription: text("requestDescription"),
  
  // Generated content
  generatedAvatarId: varchar("generatedAvatarId", { length: 64 }),
  generatedContentUrl: text("generatedContentUrl"),
  
  // Pricing
  priceUsd: int("priceUsd"), // in cents
  isPaid: boolean("isPaid").default(false).notNull(),
  
  // Status
  status: varchar("status", { length: 64 }).notNull().default("pending"), // 'pending', 'generating', 'ready', 'sent', 'cancelled'
  
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type OnlyFansContentRequest = typeof onlyfansContentRequests.$inferSelect;
export type InsertOnlyFansContentRequest = typeof onlyfansContentRequests.$inferInsert;

/**
 * OnlyFans analytics
 */
export const onlyfansAnalytics = mysqlTable("onlyfansAnalytics", {
  id: varchar("id", { length: 64 }).primaryKey(),
  accountId: varchar("accountId", { length: 64 }).notNull(),
  
  // Date
  date: timestamp("date").notNull(),
  
  // Message metrics
  messagesReceived: int("messagesReceived").default(0),
  messagesSent: int("messagesSent").default(0),
  aiResponseRate: int("aiResponseRate").default(0), // percentage
  avgResponseTime: int("avgResponseTime").default(0), // seconds
  
  // Revenue metrics
  tipsReceived: int("tipsReceived").default(0), // in cents
  ppvSales: int("ppvSales").default(0), // in cents
  totalRevenue: int("totalRevenue").default(0), // in cents
  
  // Engagement
  newSubscribers: int("newSubscribers").default(0),
  activeConversations: int("activeConversations").default(0),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type OnlyFansAnalytics = typeof onlyfansAnalytics.$inferSelect;
export type InsertOnlyFansAnalytics = typeof onlyfansAnalytics.$inferInsert;



/**
 * Personality profiles - customizable avatar personalities
 */
export const personalityProfiles = mysqlTable("personalityProfiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  avatarId: varchar("avatarId", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Personality traits
  traits: json("traits").$type<string[]>().notNull(), // e.g., ["flirty", "playful", "confident"]
  
  // Backstory and bio
  backstory: text("backstory"),
  occupation: varchar("occupation", { length: 255 }),
  age: int("age"),
  location: varchar("location", { length: 255 }),
  interests: json("interests").$type<string[]>(),
  
  // Conversation style
  conversationStyle: varchar("conversationStyle", { length: 64 }).notNull(), // "casual", "formal", "flirty", "professional"
  responseLength: mysqlEnum("responseLength", ["short", "medium", "long"]).default("medium"),
  emojiUsage: mysqlEnum("emojiUsage", ["none", "minimal", "moderate", "frequent"]).default("moderate"),
  languageStyle: varchar("languageStyle", { length: 64 }), // "casual", "sophisticated", "playful"
  
  // Voice characteristics
  voicePersonality: mysqlEnum("voicePersonality", ["seductive", "playful", "professional", "sweet", "dominant"]).default("seductive"),
  voiceName: varchar("voiceName", { length: 255 }), // Custom Hume voice name
  
  // Behavior settings
  flirtLevel: int("flirtLevel").default(5), // 1-10 scale
  nsfwWillingness: int("nsfwWillingness").default(5), // 1-10 scale
  responseSpeed: mysqlEnum("responseSpeed", ["instant", "realistic", "slow"]).default("realistic"),
  
  // Template info
  isTemplate: boolean("isTemplate").default(false),
  isPublic: boolean("isPublic").default(false),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type PersonalityProfile = typeof personalityProfiles.$inferSelect;
export type InsertPersonalityProfile = typeof personalityProfiles.$inferInsert;

