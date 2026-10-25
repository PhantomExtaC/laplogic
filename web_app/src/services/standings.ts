import {fetchJson} from '../data/client/fetchJson';
import {driverStandingsSchema,constructorStandingsSchema} from '../data/schemas';
export const getDriverStandings= (signal?:AbortSignal)=>fetchJson('data/driver_standings.json',driverStandingsSchema,signal);
export const getConstructorStandings= (signal?:AbortSignal)=>fetchJson('data/constructor_standings.json',constructorStandingsSchema,signal);
