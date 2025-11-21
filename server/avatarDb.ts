import { eq, desc } from "drizzle-orm";
import { avatars, generationHistory, users, InsertAvatar, InsertGenerationHistory } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new avatar record
 */
export async function createAvatar(avatar: InsertAvatar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(avatars).values(avatar);
  return avatar;
}

/**
 * Get all avatars for a user
 */
export async function getUserAvatars(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(avatars)
    .where(eq(avatars.userId, userId))
    .orderBy(desc(avatars.createdAt));
}

/**
 * Get a specific avatar by ID
 */
export async function getAvatarById(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(avatars)
    .where(eq(avatars.id, id))
    .limit(1);
  
  return result[0];
}

/**
 * Delete an avatar
 */
export async function deleteAvatar(id: string, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership before deleting
  const avatar = await getAvatarById(id);
  if (!avatar || avatar.userId !== userId) {
    throw new Error("Avatar not found or unauthorized");
  }
  
  await db.delete(avatars).where(eq(avatars.id, id));
  return true;
}

/**
 * Create a generation history record
 */
export async function createGenerationHistory(history: InsertGenerationHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(generationHistory).values(history);
  return history;
}

/**
 * Update generation history status
 */
export async function updateGenerationHistory(
  id: string,
  updates: Partial<InsertGenerationHistory>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(generationHistory)
    .set(updates)
    .where(eq(generationHistory.id, id));
}

/**
 * Get user's generation history
 */
export async function getUserGenerationHistory(userId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(generationHistory)
    .where(eq(generationHistory.userId, userId))
    .orderBy(desc(generationHistory.createdAt))
    .limit(limit);
}

/**
 * Get user credits
 */
export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return result[0]?.credits ?? 0;
}

/**
 * Deduct credits from user
 */
export async function deductCredits(userId: string, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const currentCredits = await getUserCredits(userId);
  if (currentCredits < amount) {
    throw new Error("Insufficient credits");
  }
  
  await db
    .update(users)
    .set({ credits: currentCredits - amount })
    .where(eq(users.id, userId));
  
  return currentCredits - amount;
}

/**
 * Add credits to user (for admin or purchase)
 */
export async function addCredits(userId: string, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const currentCredits = await getUserCredits(userId);
  const newCredits = currentCredits + amount;
  
  await db
    .update(users)
    .set({ credits: newCredits })
    .where(eq(users.id, userId));
  
  return newCredits;
}

