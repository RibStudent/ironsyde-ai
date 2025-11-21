/**
 * Database helper functions for personality profiles
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { personalityProfiles, type PersonalityProfile, type InsertPersonalityProfile } from "../drizzle/schema";

/**
 * Create a new personality profile
 */
export async function createPersonalityProfile(data: InsertPersonalityProfile): Promise<PersonalityProfile> {
  const db = await getDb();
  await db.insert(personalityProfiles).values(data);
  const [profile] = await db.select().from(personalityProfiles).where(eq(personalityProfiles.id, data.id));
  return profile;
}

/**
 * Get personality profile by ID
 */
export async function getPersonalityProfileById(profileId: string): Promise<PersonalityProfile | null> {
  const db = await getDb();
  const [profile] = await db.select().from(personalityProfiles).where(eq(personalityProfiles.id, profileId));
  return profile || null;
}

/**
 * Get all personality profiles for a user
 */
export async function getUserPersonalityProfiles(userId: string): Promise<PersonalityProfile[]> {
  const db = await getDb();
  return await db.select().from(personalityProfiles).where(eq(personalityProfiles.userId, userId)).orderBy(personalityProfiles.createdAt);
}

/**
 * Get personality profiles for a specific avatar
 */
export async function getAvatarPersonalityProfiles(avatarId: string, userId: string): Promise<PersonalityProfile[]> {
  const db = await getDb();
  return await db
    .select()
    .from(personalityProfiles)
    .where(and(eq(personalityProfiles.avatarId, avatarId), eq(personalityProfiles.userId, userId)))
    .orderBy(personalityProfiles.createdAt);
}

/**
 * Update personality profile
 */
export async function updatePersonalityProfile(
  profileId: string,
  userId: string,
  data: Partial<InsertPersonalityProfile>
): Promise<PersonalityProfile | null> {
  const db = await getDb();
  await db
    .update(personalityProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(personalityProfiles.id, profileId), eq(personalityProfiles.userId, userId)));

  return await getPersonalityProfileById(profileId);
}

/**
 * Delete personality profile
 */
export async function deletePersonalityProfile(profileId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .delete(personalityProfiles)
    .where(and(eq(personalityProfiles.id, profileId), eq(personalityProfiles.userId, userId)));

  return result.rowsAffected > 0;
}

/**
 * Get public personality templates
 */
export async function getPublicPersonalityTemplates(): Promise<PersonalityProfile[]> {
  const db = await getDb();
  return await db
    .select()
    .from(personalityProfiles)
    .where(and(eq(personalityProfiles.isTemplate, true), eq(personalityProfiles.isPublic, true)))
    .orderBy(personalityProfiles.createdAt);
}

/**
 * Clone a personality profile (for templates)
 */
export async function clonePersonalityProfile(
  sourceProfileId: string,
  userId: string,
  avatarId?: string
): Promise<PersonalityProfile> {
  const sourceProfile = await getPersonalityProfileById(sourceProfileId);
  
  if (!sourceProfile) {
    throw new Error("Source profile not found");
  }

  const { id: _id, userId: _userId, avatarId: _avatarId, createdAt: _createdAt, updatedAt: _updatedAt, ...profileData } = sourceProfile;

  const newProfile: InsertPersonalityProfile = {
    ...profileData,
    id: `profile_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId,
    avatarId: avatarId || null,
    isTemplate: false,
    isPublic: false,
  };

  return await createPersonalityProfile(newProfile);
}

