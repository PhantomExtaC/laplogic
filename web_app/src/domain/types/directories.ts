export interface Driver {
  id: string;

  fullName: string;
  abbreviation: string;

  number: number;

  nationality: string;
  dateOfBirth: string | null;
  age: number | null;

  currentTeamId: string;

  active: boolean;

  raceStarts: number;
  raceFinishes: number | null;
  dnfs: number;

  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;

  championships: number;

  currentPoints: number;

  image: string;
}
export interface Team {
  id: string;

  name: string;

  principal: string;

  base: string;

  engine: string;

  driverIds: string[];

  wins: number;
  podiums: number;
  championships: number;

  points: number;

  active: boolean;

  logo: string;
}
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
  circuitType: string | null;
  corners: number | null;
  firstGrandPrix: string | null;
  lastGrandPrix: string | null;
  laps: number | null;
  drsZones: number | null;
  // ✅ Changed from string to our new object type (and allow null just in case)
  lapRecord: LapRecord | null; 
  active: boolean;
  layout: string | null;
}