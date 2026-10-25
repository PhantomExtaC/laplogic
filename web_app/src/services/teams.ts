import {fetchJson} from '../data/client/fetchJson';
import {teamsSchema} from '../data/schemas';
export async function getTeams(){const data=await fetchJson('data/teams.json',teamsSchema);return data;}
