export interface Prediction {
  driverId: string; driverName: string; winProbability: number; predictedPosition: number;
  insights?: { trackMastery: number | null; teamMomentum: number | null; driverMomentum: number | null };
}
