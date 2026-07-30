import { describe, expect, it } from 'vitest';
import { isTrustedSource } from '../filter-trusted-sources';

describe('trusted source filtering', () => {
  it('accepts a trusted domain', () => {
    expect(isTrustedSource('bbc.com', null)).toBe(true);
  });

  it('accepts a trusted journalist even when the domain is different', () => {
    expect(isTrustedSource('x.com', 'David Ornstein, The Athletic')).toBe(true);
  });

  it('rejects an unknown source', () => {
    expect(isTrustedSource('example-unknown.com', 'Unknown Reporter')).toBe(false);
  });
});