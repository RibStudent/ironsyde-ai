/**
 * Hume EVI Authentication
 * Generates access tokens for Hume EVI WebSocket connections
 */

import { fetchAccessToken } from "hume";

const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_SECRET_KEY = process.env.HUME_SECRET_KEY;

if (!HUME_API_KEY || !HUME_SECRET_KEY) {
  console.warn("[Hume EVI] API credentials not configured");
}

/**
 * Generate access token for Hume EVI
 */
export async function generateHumeAccessToken(): Promise<string> {
  if (!HUME_API_KEY || !HUME_SECRET_KEY) {
    throw new Error("Hume API credentials not configured");
  }

  try {
    const accessToken = await fetchAccessToken({
      apiKey: HUME_API_KEY,
      secretKey: HUME_SECRET_KEY,
    });

    console.log("[Hume EVI] Access token generated successfully");
    return accessToken;
  } catch (error) {
    console.error("[Hume EVI] Error generating access token:", error);
    throw new Error(`Failed to generate Hume access token: ${error}`);
  }
}

