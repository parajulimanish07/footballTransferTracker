interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  currentClub: string;
  transferStatus: 'active' | 'inactive' | 'transferred';
  marketValue: number; // in euros
}

export type { Player };