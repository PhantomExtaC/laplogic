import {fetchJson} from '../data/client/fetchJson';
import {driversSchema} from '../data/schemas';
export async function getDrivers(){const data=await fetchJson('data/drivers.json',driversSchema);return data.map(row=>({...row,poles:row.polePositions}));}
