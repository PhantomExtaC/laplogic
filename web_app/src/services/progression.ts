import {fetchJson} from '../data/client/fetchJson';
import {progressionSchema} from '../data/schemas';
export async function getPointsProgression(signal?:AbortSignal){const data=await fetchJson('data/pointsProgression.json',progressionSchema,signal);return data;}
