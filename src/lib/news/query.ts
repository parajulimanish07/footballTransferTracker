import { z } from 'zod';

export const newsQuerySchema = z.object({
  club: z.string().trim().optional().nullable(),
  reliability: z.enum(['official', 'tier_1', 'trusted']).optional().nullable(),
  status: z.enum(['official', 'agreement_reached', 'advanced_talks', 'negotiations', 'bid_submitted', 'approach_made', 'interest', 'departure_expected']).optional().nullable(),
  direction: z.enum(['incoming', 'outgoing', 'related']).optional().nullable(),
  source: z.string().trim().optional().nullable(),
  journalist: z.string().trim().optional().nullable(),
  from: z.string().trim().optional().nullable(),
  to: z.string().trim().optional().nullable(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().nullable(),
  sort: z.enum(['latest', 'most_reliable']).optional().nullable(),
  refresh: z.coerce.boolean().optional().nullable(),
});

export type NewsQueryInput = z.infer<typeof newsQuerySchema>;