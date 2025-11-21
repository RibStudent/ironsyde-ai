import { describe, it, expect } from "vitest";
import { testReplicateConnection } from "./replicate";

describe("Replicate API Integration", () => {
  it("should successfully connect to Replicate API", async () => {
    const isConnected = await testReplicateConnection();
    expect(isConnected).toBe(true);
  }, 30000); // 30 second timeout for API call
});

