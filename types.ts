
export enum ActivityCategory {
  STUDY = 'Estudo',
  PUNCTUALITY = 'Pontualidade',
  FELLOWSHIP = 'Comunhão',
  MISSION = 'Missão',
  PRESENCE = 'Presença',
  DONATION = 'Doação',
  BAPTISM = 'Batismo',
  REDEMPTION = 'Resgate'
}

export interface Activity {
  id: string;
  label: string;
  points: number;
  category: ActivityCategory;
  description?: string;
  multiValue?: boolean; // If points are per item
  isUnitWide?: boolean; // If it applies to everyone in the unit
}

export interface Student {
  id: string;
  name: string;
  unitName: string;
  role: string;
}

export interface LogEntry {
  id: string;
  date: string;
  activityId: string;
  points: number;
  quantity: number;
  unitName: string;
  studentName: string;
  studentId?: string;
  notes?: string;
}

export interface UnitStats {
  unitName: string;
  totalPoints: number;
  entriesCount: number;
}

export interface AppUser {
  id: string;
  name: string;
  password: string;
}

// Reward interface used for the points redemption system
// Added to resolve import error in components/RewardRedemption.tsx
export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
}
