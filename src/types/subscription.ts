export type PlanDuration = '48h' | '7d' | '30d';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: PlanDuration;
  maxAudioHours: number;
  features: string[];
}

export interface UserSubscription {
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  audioHoursUsed: number;
}

export interface TranscriptionQuota {
  remainingHours: number;
  totalHours: number;
  expiresAt: Date;
}
