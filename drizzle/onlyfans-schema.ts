import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * OnlyFans account connections
 */
export const onlyfansAccounts = pgTable("onlyfans_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // OnlyFans credentials (encrypted)
  username: text("username").notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  
  // Session data
  sessionCookies: jsonb("session_cookies"),
  lastLoginAt: timestamp("last_login_at"),
  
  // Account info
  profileName: text("profile_name"),
  profileImage: text("profile_image"),
  subscriberCount: integer("subscriber_count").default(0),
  
  // Automation settings
  autoResponseEnabled: boolean("auto_response_enabled").default(true),
  autoContentDelivery: boolean("auto_content_delivery").default(false),
  responseDelay: integer("response_delay").default(30), // seconds
  
  // Status
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * OnlyFans messages/conversations
 */
export const onlyfansMessages = pgTable("onlyfans_messages", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => onlyfansAccounts.id, { onDelete: "cascade" }),
  
  // Subscriber info
  subscriberId: text("subscriber_id").notNull(),
  subscriberUsername: text("subscriber_username").notNull(),
  subscriberAvatar: text("subscriber_avatar"),
  
  // Message content
  messageType: text("message_type").notNull(), // 'text', 'media_request', 'tip', 'ppv_purchase'
  content: text("content"),
  mediaUrls: jsonb("media_urls"), // Array of media URLs if any
  
  // Direction
  isIncoming: boolean("is_incoming").notNull(),
  
  // AI Response
  aiGenerated: boolean("ai_generated").default(false),
  aiModel: text("ai_model"),
  responseTime: integer("response_time"), // milliseconds
  
  // Status
  isRead: boolean("is_read").default(false),
  needsManualReview: boolean("needs_manual_review").default(false),
  wasSent: boolean("was_sent").default(false),
  
  // Metadata
  onlyfansMessageId: text("onlyfans_message_id"),
  threadId: text("thread_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

/**
 * Content requests from subscribers
 */
export const onlyfansContentRequests = pgTable("onlyfans_content_requests", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => onlyfansAccounts.id, { onDelete: "cascade" }),
  messageId: text("message_id").references(() => onlyfansMessages.id, { onDelete: "cascade" }),
  
  // Subscriber
  subscriberId: text("subscriber_id").notNull(),
  subscriberUsername: text("subscriber_username").notNull(),
  
  // Request details
  requestType: text("request_type").notNull(), // 'photo', 'video', 'custom'
  requestDescription: text("request_description"),
  
  // Generated content
  generatedAvatarId: text("generated_avatar_id"),
  generatedContentUrl: text("generated_content_url"),
  
  // Pricing
  priceUsd: integer("price_usd"), // in cents
  isPaid: boolean("is_paid").default(false),
  
  // Status
  status: text("status").notNull().default("pending"), // 'pending', 'generating', 'ready', 'sent', 'cancelled'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

/**
 * OnlyFans analytics
 */
export const onlyfansAnalytics = pgTable("onlyfans_analytics", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => onlyfansAccounts.id, { onDelete: "cascade" }),
  
  // Date
  date: timestamp("date").notNull(),
  
  // Message metrics
  messagesReceived: integer("messages_received").default(0),
  messagesSent: integer("messages_sent").default(0),
  aiResponseRate: integer("ai_response_rate").default(0), // percentage
  avgResponseTime: integer("avg_response_time").default(0), // seconds
  
  // Revenue metrics
  tipsReceived: integer("tips_received").default(0), // in cents
  ppvSales: integer("ppv_sales").default(0), // in cents
  totalRevenue: integer("total_revenue").default(0), // in cents
  
  // Engagement
  newSubscribers: integer("new_subscribers").default(0),
  activeConversations: integer("active_conversations").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

