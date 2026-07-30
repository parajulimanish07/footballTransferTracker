import { describe, expect, it } from 'vitest';
import { newsQuerySchema } from '../query';

describe('newsQuerySchema', () => {
  it('parses valid query params', () => {
    const result = newsQuerySchema.safeParse({ page: '2', limit: '25', reliability: 'tier_1' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status values', () => {
    const result = newsQuerySchema.safeParse({ status: 'rumour' });
    expect(result.success).toBe(false);
  });
});