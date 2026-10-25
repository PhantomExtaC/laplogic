export interface DriverStanding {
  id: string;
  position: number;
  points: number;
  wins: number;
  driverName: string;
  driverNumber: number;
  nationality: string;
  currentTeamId: string | null;
  imagePath: string;
}

export interface ConstructorStanding {
  id: string;
  position: number;
  points: number;
  wins: number;
  teamName: string;
  nationality: string;
  imagePath: string;
}