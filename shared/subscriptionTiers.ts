export type SubscriptionTier = "free" | "standard" | "premium";

export interface TierFeatures {
  name: string;
  price: number; // Monthly price in dollars
  credits: number; // AI generation credits per month
  features: {
    avatarGeneration: boolean;
    textChat: boolean;
    nsfwPhotoRequests: boolean;
    voiceChat: boolean;
    maxAvatars: number;
    maxConversations: number;
    priorityGeneration: boolean;
  };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  free: {
    name: "Free",
    price: 0,
    credits: 12000,
    features: {
      avatarGeneration: true,
      textChat: true,
      nsfwPhotoRequests: false,
      voiceChat: false,
      maxAvatars: 10,
      maxConversations: 3,
      priorityGeneration: false,
    },
  },
  standard: {
    name: "Standard",
    price: 36,
    credits: 50000,
    features: {
      avatarGeneration: true,
      textChat: true,
      nsfwPhotoRequests: true, // Can request NSFW photos in chat
      voiceChat: false,
      maxAvatars: 50,
      maxConversations: 20,
      priorityGeneration: true,
    },
  },
  premium: {
    name: "Premium",
    price: 99,
    credits: 150000,
    features: {
      avatarGeneration: true,
      textChat: true,
      nsfwPhotoRequests: true,
      voiceChat: true, // Twilio voice chat enabled
      maxAvatars: -1, // Unlimited
      maxConversations: -1, // Unlimited
      priorityGeneration: true,
    },
  },
};

export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return SUBSCRIPTION_TIERS[tier];
}

export function canAccessFeature(
  userTier: SubscriptionTier,
  feature: keyof TierFeatures["features"]
): boolean {
  return SUBSCRIPTION_TIERS[userTier].features[feature] as boolean;
}

