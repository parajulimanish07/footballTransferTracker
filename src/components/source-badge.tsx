import { ReliabilityBadge } from '@/components/reliability/reliability-badge';
import type { ReliabilityLevel } from '@/types/source';

export default function SourceBadge({ reliability }: { reliability: ReliabilityLevel }) {
  return <ReliabilityBadge level={reliability} />;
}