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