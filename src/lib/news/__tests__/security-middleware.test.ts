import { describe, it, expect } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';
import demoArticles from '@/data/demo-articles.json';

describe('Security Middleware & Demo Snapshot Fallback Tests', () => {
  it('1. Blocks unauthenticated access to /admin/providers with redirect', () => {
    const req = new NextRequest('http://localhost:3000/admin/providers');
    const res = middleware(req);
    expect(res.status).toBe(307); // Next.js redirect code
    expect(res.headers.get('location')).toContain('/more');
  });

  it('2. Blocks unauthenticated access to /api/admin/export-dataset with 401 JSON', () => {
    const req = new NextRequest('http://localhost:3000/api/admin/export-dataset');
    const res = middleware(req);
    expect(res.status).toBe(401);
  });

  it('3. Allows admin access to /admin/providers when valid admin_key is supplied', () => {
    const req = new NextRequest('http://localhost:3000/admin/providers?admin_key=transfer-admin-secret-2026');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('4. Allows admin access to /api/admin/providers when x-admin-key header is supplied', () => {
    const req = new NextRequest('http://localhost:3000/api/admin/providers', {
      headers: { 'x-admin-key': 'transfer-admin-secret-2026' },
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('5. Demo snapshot dataset exists and contains valid transfer report structure', () => {
    expect(Array.isArray(demoArticles)).toBe(true);
    expect(demoArticles.length).toBeGreaterThan(0);
    expect(demoArticles[0].headline).toBeDefined();
    expect(demoArticles[0].sourceDomain).toBeDefined();
  });
});
