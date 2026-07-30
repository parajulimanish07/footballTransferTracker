import { describe, expect, it } from 'vitest';
import { classifyTransferStatus } from '../classify-transfer-status';

describe('classifyTransferStatus', () => {
  it('classifies official announcements conservatively', () => {
    expect(classifyTransferStatus('Club signs new forward', 'The club announces the signing', true)).toBe('official');
  });

  it('classifies agreement reached', () => {
    expect(classifyTransferStatus('Agreement reached for midfielder', 'deal agreed', false)).toBe('agreement_reached');
  });

  it('classifies negotiations', () => {
    expect(classifyTransferStatus('In talks for defender', 'negotiating fee', false)).toBe('negotiations');
  });

  it('defaults to interest when the language is vague', () => {
    expect(classifyTransferStatus('Club monitoring winger', 'interested but no bid yet', false)).toBe('interest');
  });
});