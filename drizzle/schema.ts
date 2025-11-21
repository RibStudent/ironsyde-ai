import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean } from "drizzle-orm/mysql-core";

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
