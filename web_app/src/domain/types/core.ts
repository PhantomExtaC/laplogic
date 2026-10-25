export type Stage = 'pre-weekend' | 'post-fp2' | 'post-quali';
export interface Session { name: string; startsAt: string | null }
export interface RaceEvent {
  raceId: string; season: number; round: number; grandPrix: string; date: string;
  sprintWeekend: boolean; status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  trackId: string | null; country: string | null; timezone: string | null; startsAt: string | null; sessions: Session[];
}
export interface MomentumPoint { raceId: string; round: number; momentum: number | null; racecraft: number | null; delta: number | null; direction: 'up' | 'down' | 'flat' | 'unknown' }
export interface MomentumData { definition: string; drivers: { driverId: string; points: MomentumPoint[] }[] }
