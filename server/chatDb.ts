import { getDb } from "./db";
import { conversations, messages, voiceCalls, type Conversation, type InsertConversation, type Message, type InsertMessage, type VoiceCall, type InsertVoiceCall } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Create a new conversation
 */
export async function createConversation(data: InsertConversation): Promise<Conversation> {
  const db = await getDb();
  await db.insert(conversations).values(data);
  return await getConversationById(data.id);
}

/**
 * Get conversation by ID
 */
export async function getConversationById(id: string): Promise<Conversation | null> {
  const db = await getDb();
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return conversation || null;
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const db = await getDb();
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.lastMessageAt));
}

/**
 * Get conversations for a specific avatar
 */
export async function getAvatarConversations(userId: string, avatarId: string): Promise<Conversation[]> {
  const db = await getDb();
  return await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.avatarId, avatarId)))
    .orderBy(desc(conversations.lastMessageAt));
}

/**
 * Update conversation last message timestamp
 */
export async function updateConversationTimestamp(conversationId: string): Promise<void> {
  const db = await getDb();
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  const db = await getDb();
  // Delete all messages first
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
  // Delete conversation
  await db.delete(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
}

/**
 * Create a new message
 */
export async function createMessage(data: InsertMessage): Promise<Message> {
  const db = await getDb();
  await db.insert(messages).values(data);
  await updateConversationTimestamp(data.conversationId);
  return await getMessageById(data.id);
}

/**
 * Get message by ID
 */
export async function getMessageById(id: string): Promise<Message | null> {
  const db = await getDb();
  const [message] = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return message || null;
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId: string, limit: number = 100): Promise<Message[]> {
  const db = await getDb();
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

/**
 * Create a voice call record
 */
export async function createVoiceCall(data: InsertVoiceCall): Promise<VoiceCall> {
  const db = await getDb();
  await db.insert(voiceCalls).values(data);
  return await getVoiceCallById(data.id);
}

/**
 * Get voice call by ID
 */
export async function getVoiceCallById(id: string): Promise<VoiceCall | null> {
  const db = await getDb();
  const [call] = await db.select().from(voiceCalls).where(eq(voiceCalls.id, id)).limit(1);
  return call || null;
}

/**
 * Update voice call status
 */
export async function updateVoiceCallStatus(
  id: string,
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed",
  duration?: number
): Promise<void> {
  const db = await getDb();
  const updates: any = { status };
  if (status === "completed" || status === "failed") {
    updates.endedAt = new Date();
  }
  if (duration !== undefined) {
    updates.duration = duration;
  }
  await db.update(voiceCalls).set(updates).where(eq(voiceCalls.id, id));
}

