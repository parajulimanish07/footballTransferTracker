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

  it('correctly filters non-transfer news headlines (tragedies, FIFA presidency, trivia)', () => {
    expect(classifyTransferStatus("Mark Hughes' son died of sudden adult death syndrome", 'Alex Hughes was found collapsed at his home', false)).toBe('not_transfer_news');
    expect(classifyTransferStatus('Infantino sorry for errors but stays Fifa president', 'Gianni Infantino will remain Fifa president', false)).toBe('not_transfer_news');
    expect(classifyTransferStatus("Argentina mark World Cup win over England with 'National Football Teams Day'", 'AFA announces 15 July as National Football Teams Day', false)).toBe('not_transfer_news');
  });

  it('correctly classifies completed transfer joins as official', () => {
    expect(classifyTransferStatus('Defender George joins Brighton from Man Utd', 'Gabby George has completed a move to Brighton', false)).toBe('official');
  });
});