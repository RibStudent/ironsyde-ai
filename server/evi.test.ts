import { describe, it, expect } from 'vitest';

describe('Hume EVI Integration', () => {
  it('should have Hume API credentials configured', () => {
    expect(process.env.HUME_API_KEY).toBeTruthy();
    expect(process.env.HUME_SECRET_KEY).toBeTruthy();
    expect(process.env.HUME_API_KEY).toContain('qHSDhNBL1YgHYzXuNGPzv7AusxrOqQu0C0vGbPmYORGfXgZO');
  });

  it('should have EVI components installed', () => {
    // Check that the necessary packages are available
    expect(() => require('@humeai/voice-react')).not.toThrow();
    expect(() => require('hume')).not.toThrow();
  });
});

