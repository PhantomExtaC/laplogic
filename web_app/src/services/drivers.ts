import {fetchJson} from '../data/client/fetchJson';
import {driversSchema} from '../data/schemas';
export async function getDrivers(signal?: AbortSignal){const data=await fetchJson('data/drivers.json',driversSchema,signal);return data.map(row=>({...row,poles:row.polePositions}));}
