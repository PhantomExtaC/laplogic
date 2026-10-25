export interface LapRecord {
  time: string;
  driver: string;
  year: string | number;
  seconds: number;
}

export interface Track {
  id: string;
  name: string;
  country: string;
  city: string;
  lengthKm: number | null;
  corners: number | null;
  firstGrandPrix: string | null;
  lastGrandPrix: string | null;
  laps: number | null;
  drsZones: number | null;
  // âœ… Changed from string to our new object type (and allow null just in case)
  lapRecord: LapRecord | null; 
  active: boolean;
  layout: string | null;
}