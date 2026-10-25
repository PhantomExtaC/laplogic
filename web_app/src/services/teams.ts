import {fetchJson} from '../data/client/fetchJson';
import {teamsSchema} from '../data/schemas';
export async function getTeams(signal?: AbortSignal){const data=await fetchJson('data/teams.json',teamsSchema,signal);return data;}
