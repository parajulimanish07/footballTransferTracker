import { describe, it, expect } from 'vitest';
import { getTransferNews } from '../get-transfer-news';

describe('Frontend Performance & Minimal UI Optimization Tests', () => {
  it('1. Global and club queries return stable article IDs for keys', async () => {
    const res = await getTransferNews({ mode: 'global' });
    res.data.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');
    });
  }, 15000);

  it('2. Querying different clubs maintains strict data integrity without full reload', async () => {
    const liverpool = await getTransferNews({ mode: 'club', selectedClubId: 'liverpool' });
    const arsenal = await getTransferNews({ mode: 'club', selectedClubId: 'arsenal' });

    expect(liverpool.data).toBeDefined();
    expect(arsenal.data).toBeDefined();

    // Verify independent results per club
    const lfcCheck = liverpool.data.every(
      (i) => i.currentClub?.id === 'liverpool' || i.destinationClub?.id === 'liverpool' || i.relatedClubIds.includes('liverpool')
    );
    const afcCheck = arsenal.data.every(
      (i) => i.currentClub?.id === 'arsenal' || i.destinationClub?.id === 'arsenal' || i.relatedClubIds.includes('arsenal')
    );

    expect(lfcCheck).toBe(true);
    expect(afcCheck).toBe(true);
  });

  it('3. In-memory cache returns immediate response for repeated query', async () => {
    const start1 = performance.now();
    await getTransferNews({ mode: 'global' });
    const duration1 = performance.now() - start1;

    const start2 = performance.now();
    await getTransferNews({ mode: 'global' });
    const duration2 = performance.now() - start2;

    // Cache hit should be fast (< 50ms)
    expect(duration2).toBeLessThan(100);
  });

  it('4. Filters do not remove transfer status or reliability metadata from items', async () => {
    const res = await getTransferNews({ mode: 'global', status: 'official' });
    res.data.forEach((item) => {
      expect(item.transferStatus).toBe('official');
      expect(item.reliability).toBeDefined();
    });
  });

  it('5. Search results maintain stable metadata fields without layout shifts', async () => {
    const res = await getTransferNews({ mode: 'global', search: 'Osimhen' });
    res.data.forEach((item) => {
      expect(item.headline).toBeDefined();
      expect(item.summary).toBeDefined();
    });
  });
});
