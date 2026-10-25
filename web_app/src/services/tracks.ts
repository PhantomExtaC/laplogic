import {fetchJson} from '../data/client/fetchJson';
import {tracksSchema,assetSchema} from '../data/schemas';
export async function getTracks(){const [data,assets]=await Promise.all([fetchJson('data/tracks.json',tracksSchema),fetchJson('data/asset_manifest.json',assetSchema)]);return data.map(row=>({...row,corners:row.turns,layout:row.layoutImage && assets.data.includes(row.layoutImage)?row.layoutImage:null,laps:null,drsZones:null,lapRecord:row.lapRecord?{time:row.lapRecord.time,driver:row.lapRecord.driver,year:row.lapRecord.year,seconds:row.lapRecord.milliseconds}:null}));}
